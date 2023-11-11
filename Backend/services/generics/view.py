from sqlalchemy.exc import IntegrityError

from db_config import SessionMaker
from services import check_allowed_methods_middleware, view_function_middleware, ValidationError, DatabaseError
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
        self.session = SessionMaker()
        self.instance = None
        self.response = None
        self.request = None
        self.headers = None
        self.body = None
        self.url = None
        self.method = None
        self.instance_id = None

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get(self, request: dict) -> dict:
        """
        Get response with desired model`s dictionary.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        if self.instance is None:
            raise ValidationError(f"{self.model_name.capitalize()} with given id does not exist.", 400)

        self.response.status_code = 200
        self.response.data = self.instance.to_dict()
        return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, **kwargs) -> dict:
        """
        Get all instances of model.
        :param request: dictionary containing url, method and body
        :param kwargs: arguments to be checked, here you need to pass fields on which instances will be filtered
        :return: dictionary containing status_code and response body with list of dictionaries of instances` data
        """
        query = self.session.query(self.model)

        # Applying filters
        for column, value in kwargs.items():
            if hasattr(self.model, column):
                query = query.filter(getattr(self.model, column) == value)

        instances = query.all()
        body = [instance.to_dict() for instance in instances]
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
        if self.instance is None:
            raise ValidationError(f"{self.model_name.capitalize()} with given id does not exist.", 400)

        self.session.delete(self.instance)
        self.session.commit()

        self.response.status_code = 204
        # self.response.message = f"{self.model_name.capitalize()} with given id has been deleted."
        return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create instance of model by given arguments.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        try:
            instance = self.model(**self.body)
            self.session.add(instance)
            self.session.commit()

            self.response.status_code = 201
            self.response.data = instance.to_dict()
            return self.response.create_response()

        except IntegrityError as e:
            self.session.rollback()
            raise DatabaseError(str(e))

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update instance of model by given arguments.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        if self.instance is None:
            raise ValidationError(f"{self.model_name.capitalize()} with given id does not exist.", 400)

        try:
            for key, value in self.body.items():
                if hasattr(self.instance, key):
                    setattr(self.instance, key, value)
            self.session.commit()

            self.response.status_code = 200
            self.response.data = self.instance.to_dict()
            return self.response.create_response()

        except IntegrityError as e:
            raise DatabaseError(str(e))
