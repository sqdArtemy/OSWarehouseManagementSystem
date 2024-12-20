from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Query

from db_config import get_session
from services import check_allowed_methods_middleware, view_function_middleware
from utilities.exceptions import ValidationError, DatabaseError
from utilities.enums.method import Method


class ModelAttributesMeta(type):
    """
    Metaclass ensuring that ViewClass should have model and model_name attributes.
    """
    def __init__(cls, name, bases, attrs):
        if 'model' not in attrs or 'model_name' not in attrs:
            raise TypeError(f"Subclasses of GenericView must define 'model' and 'model_name' attributes")
        super(ModelAttributesMeta, cls).__init__(name, bases, attrs)


class GenericView(metaclass=ModelAttributesMeta):
    """
    Generic CRUD view for all models.
    """
    model = None
    model_name = None

    def __init__(self):
        self.instance = None
        self.response = None
        self.request = None
        self.headers = None
        self.body = None
        self.filters = None
        self.url = None
        self.method = None
        self.instance_id = None
        self.requester_id = None
        self.requester_role = None

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get(self, request: dict) -> dict:
        """
        Get response with desired model`s dictionary.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        if self.instance is None:
            raise ValidationError(f"{self.model_name.capitalize()} with given id does not exist.", 404)

        self.response.status_code = 200
        self.response.data = self.instance.to_dict(cascade_fields=[])
        return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, pre_selected_query: Query = None, cascade_fields: list[str] = (), **kwargs) -> dict:
        """
        Get all instances of model.
        :param request: dictionary containing url, method and body
        :param pre_selected_query: query which will be used to get instances
        :param cascade_fields: fields which will be expanded in response
        :param kwargs: arguments to be checked, here you need to pass fields on which instances will be filtered
        :return: dictionary containing status_code and response body with list of dictionaries of instances` data
        """
        with get_session() as session:
            if pre_selected_query is not None:
                query = pre_selected_query
            else:
                query = session.query(self.model)

            # Applying filters
            for column, value in kwargs.items():
                # if column_gte then find all model instances with value >= value_gte
                if column.endswith("_gte"):
                    column_name = column[:-4]
                    if hasattr(self.model, column_name):
                        query = query.filter(getattr(self.model, column_name) >= value)
                # if column_lte then find all model instances with value <= value_lte
                elif column.endswith("_lte"):
                    column_name = column[:-4]
                    if hasattr(self.model, column_name):
                        query = query.filter(getattr(self.model, column_name) <= value)
                # if column_like then find all model instances with value like value_like
                elif column.endswith("_like"):
                    column_name = column[:-5]
                    if hasattr(self.model, column_name):
                        query = query.filter(getattr(self.model, column_name).like(f"%{value}%"))
                elif hasattr(self.model, column):
                    query = query.filter(getattr(self.model, column) == value)

            instances = query.all()
            body = [instance.to_dict(cascade_fields=cascade_fields) for instance in instances]
            self.response.status_code = 200
            self.response.data = body

            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.DELETE.value])
    def delete(self, request: dict) -> dict:
        """
        Delete instance of model by given arguments.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            if self.instance is None:
                raise ValidationError(f"{self.model_name.capitalize()} with given id does not exist.", 400)

            merged = session.merge(self.instance)
            session.delete(merged)
            session.commit()

            self.response.status_code = 204
            self.response.message = f"{self.model_name.capitalize()} with given id has been deleted."
            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create instance of model by given arguments.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            try:
                instance = self.model(**self.body)
                session.add(instance)
                session.commit()

                self.response.status_code = 201
                self.response.data = instance.to_dict()
                return self.response.create_response()

            except IntegrityError as e:
                session.rollback()
                raise DatabaseError(str(e))

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update instance of model by given arguments.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            if self.instance is None:
                raise ValidationError(f"{self.model_name.capitalize()} with given id does not exist.", 404)

            try:
                for key, value in self.body.items():
                    if hasattr(self.instance, key):
                        setattr(self.instance, key, value)
                session.commit()

                self.response.status_code = 200
                self.response.data = self.instance.to_dict()
                return self.response.create_response()

            except IntegrityError as e:
                raise DatabaseError(str(e))
