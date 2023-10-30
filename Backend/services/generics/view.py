from sqlalchemy.exc import IntegrityError

from db_config import Base, SessionMaker
from services import check_allowed_methods_middleware, view_function_middleware
from utilities.enums.method import Method


class GenericView:
    """
    Generic CRUD view for all models.
    """
    def __init__(self, model: Base, model_name: str):
        self.session = SessionMaker()
        self.model = model
        self.model_name = model_name
        self.instance = None
        self.response = None

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get(self, request: dict) -> dict:
        """
        Get response with desired model`s dictionary.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        if self.instance is None:
            self.response.status_code = 404
            self.response.message = f"{self.model_name.capitalize()} with given id does not exist."
            return self.response.create_response()

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
        instances = self.session.query(self.model).filter(**kwargs).all()
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
            self.response.status_code = 404
            self.response.message = f"{self.model_name.capitalize()} with given id does not exist."
            return self.response.create_response()

        self.instance.delete()
        self.session.commit()

        self.response.status_code = 200
        self.response.message = f"{self.model_name.capitalize()} with given id has been deleted."
        return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict, **kwargs) -> dict:
        """
        Create instance of model by given arguments.
        :param request: dictionary containing url, method and body
        :param kwargs: arguments to be checked, here you need to pass fields on which single instance will be created
        :return: dictionary containing status_code and response body
        """
        try:
            instance = self.model(**kwargs)
            self.session.add(instance)
            self.session.commit()

            self.response.status_code = 201
            self.response.data = instance.to_dict()
            return self.response.create_response()

        except IntegrityError as e:
            self.session.rollback()
            self.response.status_code = 400
            self.response.message = str(e)
            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict, **kwargs) -> dict:
        """
        Update instance of model by given arguments.
        :param request: dictionary containing url, method and body
        :param kwargs: arguments to be checked, here you need to pass fields on which single instance will be updated
        :return: dictionary containing status_code and response body
        """

        try:
            for key, value in kwargs.items():
                setattr(self.instance, key, value)
            self.session.commit()

            self.response.status_code = 200
            self.response.data = self.instance.to_dict()
            return self.response.create_response()

        except IntegrityError as e:
            self.session.rollback()
            self.response.status_code = 400
            self.response.message = str(e)
            return self.response.create_response()
