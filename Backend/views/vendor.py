from models import Vendor, User
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities import decode_token
from utilities.enums.data_related_enums import UserRole
from utilities.enums.method import Method
from utilities.exceptions import ValidationError


class VendorView(GenericView):
    model = Vendor
    model_name = "vendor"

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create a new vendor in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """

        user_id = decode_token(self.headers.get("token"))

        # get the role for  user_id
        user = self.session.query(User).filter(User.user_id == user_id).first()

        # if role is not vendor then return 403
        if user.user_role != UserRole.VENDOR.value["name"]:
            self.response.status_code = 403
            self.response.message = "Ebanmisan? San vendor emassan"
            return self.response.create_response()

        # If the vendor_name of this vendor owner already exists
        vendor_name = self.body.get("vendor_name")

        query = self.session.query(Vendor).filter(Vendor.vendor_owner_id == user_id)
        query = query.filter(Vendor.vendor_name == vendor_name)
        if query.first() is not None:
            self.response.status_code = 400
            self.response.message = "The store point already exists for this vendor"
            return self.response.create_response()

        # else just add owner_id to the body
        else:
            self.body["vendor_owner_id"] = user_id

        return super().create(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update a vendor in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        # TODO: Add checkers and validations
        return super().update(request=request)
