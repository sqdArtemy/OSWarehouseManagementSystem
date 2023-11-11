from models import Rack
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities.enums.method import Method


class RackView(GenericView):
    model = Rack
    model_name = "rack"

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create a new rack in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        # TODO: Add checkers and validations
        return super().create(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update a rack in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        # TODO: Add checkers and validations
        return super().update(request=request)
