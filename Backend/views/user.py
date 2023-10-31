from sqlalchemy.exc import IntegrityError

from models import User, Company
from db_config import get_session, SessionMaker
from utilities import (
    hash_password, is_email_valid, is_phone_valid, create_token, check_password, decode_token,
    is_instance_already_exists
)
from services import (check_allowed_methods_middleware, check_allowed_roles_middleware, view_function_middleware,
                      ValidationError, DatabaseError)
from utilities.enums.method import Method
from utilities.enums.data_related_enums import UserRole
from utilities.templates import ResponseFactory
from services.generics import GenericView

from .company import create_company, is_company_already_exists


class UserView(GenericView):
    model = User
    model_name = "user"

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def sign_up(self, request: dict) -> dict:
        """
        'Endpoint' to create a new user along with the company
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """

        # Check if user role is valid
        if self.body["user_role"] not in ("owner", "customer"):
            raise ValidationError("Only warehouse owner or customers can register to the service.")

        # Check if password and confirm_password are the same
        if self.body["password"] != self.body["confirm_password"]:
            raise ValidationError("Password and confirm password are not the same.")

        if not is_email_valid(self.body["user_email"]):
            raise ValidationError("Invalid email address.")

        if not is_phone_valid(self.body["user_phone"]):
            raise ValidationError("Invalid phone number.")

        if is_company_already_exists(self.body["company_email"]):
            raise DatabaseError("Company with given email already exists.")

        # Creation of new company
        new_company_id = create_company(
            {
                "company_name": self.body["company_name"],
                "company_email": self.body["company_email"]
            }
        )

        try:
            with get_session() as session:
                # Creation of new user
                new_user = User(
                    user_name=self.body["user_name"],
                    user_surname=self.body["user_surname"],
                    user_email=self.body["user_email"],
                    user_role=self.body["user_role"],
                    user_phone=self.body["user_phone"],
                    user_password=hash_password(self.body["password"]).decode("utf8"),
                    company_id=new_company_id
                )
                session.add(new_user)
                session.commit()

                # Setting token in headers
                self.headers["token"] = create_token(new_user.user_id, new_user.user_role)

                self.response.status_code = 201
                self.response.data = new_user.to_dict()
                return self.response.create_response()

        except IntegrityError:
            session.rollback()
            session.delete(session.query(Company).filter_by(company_id=new_company_id).first())
            session.commit()

            # Check if user email is already registered
            if is_instance_already_exists(User, user_email=self.body["user_email"]):
                raise DatabaseError("User email is already registered.")

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def login(self, request: dict) -> dict:
        """
        'Endpoint' to login user.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """

        if not is_email_valid(self.body["user_email"]):
            raise ValidationError("Invalid email address.")

        with get_session() as session:
            user = session.query(User).filter_by(user_email=self.body["user_email"]).first()

            if not user or not check_password(user.user_password, self.body["password"]):
                raise ValidationError("Wrong credentials.")

            # Setting token in headers
            self.headers["token"] = create_token(user.user_id, user.user_role)

            self.response.status_code = 200
            self.response.data = user.to_dict()
            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def change_password(self, request: dict) -> dict:
        """
        'Endpoint' to change user password.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """

        user_id = decode_token(self.headers["token"])
        old_password = self.body["old_password"]
        new_password = self.body["new_password"]
        confirm_password = self.body["confirm_password"]

        # Check if password and confirm_password are the same
        if new_password != confirm_password:
            raise ValidationError("Password and confirm password are not the same.")

        with get_session() as session:
            user = session.query(User).filter_by(user_id=user_id).first()

            if not user or not check_password(user.user_password, old_password):
                raise ValidationError("Wrong credentials.")

            user.user_password = hash_password(new_password).decode("utf8")
            session.commit()

            self.response.status_code = 200
            self.response.data = user.to_dict()
            return self.response.create_response()


@check_allowed_roles_middleware([UserRole.OWNER.value["code"]])
@check_allowed_methods_middleware([Method.POST.value])
def add_employee(request: dict) -> dict:
    """
    'Endpoint' to create a new employee for a company. Can be used only by the owner of the company.
    :param request: dictionary containing url, method and body
    :return: dictionary containing status_code and response body
    """
    body = request.get("body", {})
    headers = request.get("headers", {})
    response = ResponseFactory(400, {}, "", headers)

    # Get owner id from token and retrieve owner`s company
    owner_id = decode_token(headers["token"])
    company = SessionMaker().query(User).filter_by(user_id=owner_id).first().company
    company_id = company.company_id
    company_name = company.company_name

    # Autogenerate password from data
    employee_name = body["user_name"]
    employee_email = body["user_email"]
    employee_surname = body["user_surname"]
    employee_phone = body["user_phone"]
    employee_role = body["user_role"]
    password = f"{company_name[0]}{employee_name[0]}{employee_surname[0]}{employee_phone[1:5]}"

    if employee_role not in (UserRole.MANAGER.value["name"], UserRole.SHIPPER.value["name"]):
        response.message = "Only managers or shippers can be added to the company."
        return response.create_response()

    if not is_email_valid(employee_email):
        response.message = "Invalid email address."
        return response.create_response()

    if not is_phone_valid(employee_phone):
        response.message = "Invalid phone number."
        return response.create_response()

    try:
        with get_session() as session:
            new_employee = User(
                user_name=employee_name,
                user_surname=employee_surname,
                user_email=employee_email,
                user_role=employee_role,
                user_phone=employee_phone,
                user_password=hash_password(password).decode("utf8"),
                company_id=company_id
            )

            session.add(new_employee)
            session.commit()

            response.status_code = 201
            response.data = new_employee.to_dict()
            return response.create_response()

    except IntegrityError:
        session.rollback()

        # Check if user email is already registered
        if is_instance_already_exists(User, user_email=body["user_email"]):
            response.message = "User email is already registered."
            return response.create_response()
