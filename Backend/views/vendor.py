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
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, **kwargs) -> dict:
        """
        Get all instances of model.
        :param request: dictionary containing url, method and body
        :param kwargs: arguments to be checked, here you need to pass fields on which instances will be filtered
        :return: dictionary containing status_code and response body with list of dictionaries of vendors
        """
        # get owner_id from token and filter vendors by it
        owner_id = decode_token(self.headers.get("token"))
        vendors = self.session.query(Vendor).filter(Vendor.vendor_owner_id == owner_id)

        # create response
        instances = vendors.all()
        body = [instance.to_dict() for instance in instances]
        self.response.status_code = 200
        self.response.data = body

        return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get(self, request: dict) -> dict:
        """
        Get response with desired vendor`s dictionary.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        # check id user_id from token and vendor_owner_id are the same
        user_id = decode_token(self.headers.get("token"))
        vendor = self.session.query(Vendor).filter(Vendor.vendor_owner_id == user_id).first()
        if self.instance is not None and vendor.vendor_owner_id != self.instance.vendor_owner_id:
            raise ValidationError("Vendor with given id does not exist.", 404)

        return super().get(request=request)

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
