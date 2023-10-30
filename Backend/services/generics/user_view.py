from sqlalchemy.exc import IntegrityError

from models import User
from .abstract_view import AbstractGenericView
from services import view_function_middleware, check_allowed_methods_middleware
from utilities.enums.method import Method


class UserView(AbstractGenericView):
    model = User
    model_name = "user"

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get(self, request: dict) -> dict:
        """
        Get response with User model`s dictionary.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        if self.instance is None:
            self.response.status_code = 404
            self.response.message = "User with given id does not exist."
            return self.response.create_response()

        self.response.status_code = 200
        self.response.data = self.instance.to_dict()
        return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, **kwargs) -> dict:
        """
        Get all instances of User model.
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
        Delete instance of User by given arguments.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        if self.instance is None:
            self.response.status_code = 404
            self.response.message = "User with given id does not exist."
            return self.response.create_response()

        self.session.delete(self.instance)
        self.session.commit()

        # TODO: I guess it is better to put here 204 (No content - typical response after DELETE) instead of 200
        self.response.status_code = 200
        self.response.message = "User with given id has been deleted."
        return self.response.create_response()

    # TODO: When we create user just passing parameters, we also pass password
    # TODO: So, the problem is that it just stores password without encryption
    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict, **kwargs) -> dict:
        """
        Create instance of User by given arguments.
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
        Update instance of User by given arguments.
        :param request: dictionary containing url, method and body
        :param kwargs: arguments to be checked, here you need to pass fields on which single instance will be updated
        :return: dictionary containing status_code and response body
        """
        try:
            if self.instance is None:
                self.response.status_code = 404
                self.response.message = "User with given id does not exist."
                return self.response.create_response()

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
