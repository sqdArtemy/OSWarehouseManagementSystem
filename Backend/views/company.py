from db_config import SessionMaker
from models import Company, User
from utilities import is_email_valid, is_instance_already_exists, decode_token
from services import check_allowed_methods_middleware,  view_function_middleware, check_allowed_roles_middleware
from utilities.exceptions import ValidationError, DatabaseError
from utilities.enums.method import Method
from utilities.enums.data_related_enums import UserRole
from services.generics import GenericView


class CompanyView(GenericView):
    model = Company
    model_name = "company"

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create a new company in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        company_email = self.body.get("company_email")

        if not is_email_valid(company_email):
            raise ValidationError("Invalid company`s email address")

        if is_instance_already_exists(Company, company_email=company_email):
            raise DatabaseError("Company with this email already exists")

        return super().create(request=request)

    @view_function_middleware
    @check_allowed_roles_middleware([UserRole.MANAGER.value["code"]])
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update a company in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        company_email = self.body.get("company_email")
        owner_id = decode_token(self.headers["token"])
        company = SessionMaker().query(User).filter_by(user_id=owner_id).first().company

        if company.company_id != self.instance.company_id:
            raise ValidationError(status_code=403, message="You are not allowed to update this company.")

        if company_email:
            if not is_email_valid(company_email):
                raise ValidationError("Invalid email address")

            if is_instance_already_exists(Company, company_email=company_email):
                raise DatabaseError("Company with this email already exists")

        return super().update(request=request)
