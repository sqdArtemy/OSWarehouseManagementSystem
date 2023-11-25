from db_config import get_session
from models import Transport
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities.enums.method import Method
from utilities.enums.data_related_enums import UserRole
from utilities.exceptions import ValidationError


class TransportView(GenericView):
    model = Transport
    model_name = "transport"

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create new transport in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        # TODO: Add checkers and validations

        # check if the user is admin
        if self.requester_role != UserRole.ADMIN.value["code"]:
            raise ValidationError("Access forbidden", 403)

        # check if fields are > 0
        if (self.body["transport_capacity"] <= 0 or self.body["transport_speed"] <= 0
                or self.body["price_per_weight"] <= 0):
            raise ValidationError("One or more numerical fields violate constraints", 400)

        # check if the type is valid
        if self.body["transport_type"] not in ['truck', 'van', 'car', 'helicopter']:
            raise ValidationError("Invalid transport type", 400)

        return super().create(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update transport in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        # TODO: Add checkers and validations
        return super().update(request=request)
