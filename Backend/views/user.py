from sqlalchemy.exc import IntegrityError

from models import User, Company
from db_config import get_session
from utilities import (
    hash_password, is_email_valid, is_phone_valid, create_token, check_password, decode_token,
    is_instance_already_exists, extract_id_from_url
)
from services import check_allowed_methods_middleware, check_allowed_roles_middleware, view_function_middleware
from utilities.exceptions import ValidationError, DatabaseError
from utilities.enums.method import Method
from utilities.enums.data_related_enums import UserRole
from services.generics import GenericView

from .company import CompanyView


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
        if self.body["user_role"] not in (UserRole.MANAGER.value["name"], UserRole.VENDOR.value["name"]):
            raise ValidationError("Only warehouse managers or vendors can register to the service.")

        # Check if password and confirm_password are the same
        if self.body["password"] != self.body["confirm_password"]:
            raise ValidationError("Password and confirm password are not the same.")

        if not is_email_valid(self.body["user_email"]):
            raise ValidationError("Invalid user`s email address.")

        if not is_phone_valid(self.body["user_phone"]):
            raise ValidationError("Invalid phone number.")

        # Create new company
        company_response = CompanyView().create(
            request={
                "method": Method.POST.value,
                "body": {
                    "company_name": self.body["company_name"],
                    "company_email": self.body["company_email"]
                }
            }
        )
        new_company_id = int(company_response.get("body").get("company_id"))

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
                    company_id=new_company_id,
                    is_password_forgotten=0
                )
                session.add(new_user)
                session.commit()

                # Setting token in headers
                self.headers["token"] = create_token(new_user.user_id, new_user.user_role)

                self.response.status_code = 201
                self.response.data = new_user.to_dict()
                return self.response.create_response()

        except IntegrityError as e:
            session.rollback()
            session.delete(session.query(Company).filter_by(company_id=new_company_id).first())
            session.commit()

            # Check if user email is already registered
            if is_instance_already_exists(User, user_email=self.body["user_email"]):
                raise DatabaseError("User email is already registered.")

            if is_instance_already_exists(User, user_phone=self.body["user_phone"]):
                raise DatabaseError("User phone is already registered.")

            raise DatabaseError(str(e))

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
    @check_allowed_methods_middleware([Method.PUT.value])
    def change_password(self, request: dict) -> dict:
        """
        'Endpoint' to change user password.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """

        user_id = decode_token(self.headers.get("token"))
        old_password = self.body.get("old_password")
        new_password = self.body.get("new_password")
        confirm_password = self.body.get("confirm_password")

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

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, **kwargs) -> dict:
        """
        Get list of all users.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            requester_id = decode_token(self.headers.get("token"))
            if self.requester_role == UserRole.ADMIN.value["code"]:
                return super().get_list(request=request, **kwargs)
            else:
                if requester_id is None:
                    raise ValidationError("Unauthorized", 401)
                requester_company = session.query(User).filter_by(user_id=requester_id).first().company
                query = session.query(self.model).filter_by(company_id=requester_company.company_id)
                return super().get_list(request=request, pre_selected_query=query, **kwargs)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        with get_session() as session:
            # Check if requested user is the same as the one that should be updated or if the requester is owner of the
            # company where user is located
            requester_id = decode_token(self.headers.get("token"))
            requester = session.query(User).filter_by(user_id=requester_id).first()

            if self.instance_id != requester_id and (
                    self.instance.company_id != requester.company_id or requester.user_role != UserRole.MANAGER.value[
                "name"]
            ) and self.requester_role != UserRole.ADMIN.value["code"] and self.requester_role != UserRole.VENDOR.value[
                "code"]:
                raise ValidationError(status_code=401, message="You can not update data of this user.")

            # Remove password if it was passed
            if "user_password" in self.body:
                del self.body["user_password"]

            return super().update(request=request)

    @view_function_middleware
    @check_allowed_roles_middleware([UserRole.MANAGER.value["code"], UserRole.ADMIN.value["code"]])
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        'Endpoint' to create a new employee for a company. Can be used only by the owner of the company.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            # Get owner id from token and retrieve owner`s company
            owner_id = decode_token(self.headers.get("token"))
            company = session.query(User).filter_by(user_id=owner_id).first().company
            company_id = company.company_id

            # Autogenerate password from data
            employee_name = self.body["user_name"]
            employee_email = self.body["user_email"]
            employee_surname = self.body["user_surname"]
            employee_phone = self.body["user_phone"]
            employee_role = self.body["user_role"]
            password = f"{employee_name[0]}{employee_surname[0]}{employee_phone[-4:]}"

            # Validating fields

            if not is_email_valid(employee_email):
                raise ValidationError("Invalid email address.")

            if not is_phone_valid(employee_phone):
                raise ValidationError("Invalid phone number.")

            # Checking if user already exists or not
            if is_instance_already_exists(User, user_email=self.body["user_email"]):
                raise DatabaseError("User email is already registered.")

            if self.requester_role == UserRole.MANAGER.value["code"] and employee_role not in (
                    UserRole.SUPERVISOR.value["name"]
            ):
                raise ValidationError("Only managers can be added to the company.")

            if self.requester_role == UserRole.ADMIN.value["code"] and self.body.get("company_id"):
                company_id = self.body.get("company_id")
                if not is_instance_already_exists(Company, company_id=company_id):
                    raise ValidationError("Company with given id does not exist.")

            new_body = dict(
                user_name=employee_name,
                user_surname=employee_surname,
                user_email=employee_email,
                user_role=employee_role,
                user_phone=employee_phone,
                user_password=hash_password(password).decode("utf8"),
                company_id=company_id
            )
            self.body = new_body
            request["body"] = new_body

            return super().create(request=request)

    @view_function_middleware
    @check_allowed_roles_middleware([UserRole.MANAGER.value["code"], UserRole.ADMIN.value["code"]])
    @check_allowed_methods_middleware([Method.DELETE.value])
    def delete(self, request: dict) -> dict:
        """
        Endpoint to delete user.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """

        with get_session() as session:
            # define objects
            id_to_del = extract_id_from_url(request["url"], "user")
            user_to_del = session.query(User).filter_by(user_id=id_to_del).first()
            user_id = decode_token(self.headers.get("token"))
            user = session.query(User).filter_by(user_id=user_id).first()

            # Check that user cannot delete himself
            if id_to_del == user_id:
                raise ValidationError("You cannot delete yourself.")

            if user_to_del.user_role == UserRole.SUPERVISOR.value["name"] and len(user_to_del.warehouses) > 0:
                raise ValidationError("You cannot delete supervisor who has warehouses.")

            # check if there is user_to_be_deleted in DB and
            # is from the same company as the user who wants to delete
            if not user_to_del or user_to_del.company_id != user.company_id:
                raise ValidationError("User Not Found", 404)

            # set null if manager has warehouse
            elif user_to_del.user_role == UserRole.SUPERVISOR.value["name"]:
                for warehouse in user_to_del.warehouses:
                    warehouse.manager = None
                user_to_del.warehouses = []
                session.commit()

            # empty body
            request["body"] = self.body = dict()

            return super().delete(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def forgot_password(self, request: dict) -> dict:
        """
        Endpoint to delete user.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        employee_email = self.body["user_email"]

        with get_session() as session:
            user_emails = session.query(User.user_email).all()
            user_emails = [user[0] for user in user_emails]
            if employee_email not in user_emails:
                raise ValidationError("Wrong Credentials", 401)

            user = session.query(User).filter_by(user_email=employee_email).first()
            user.is_password_forgotten = 1
            session.commit()
            self.response.status_code = 200
            return self.response.create_response()

    @view_function_middleware
    @check_allowed_roles_middleware([UserRole.ADMIN.value["code"]])
    @check_allowed_methods_middleware([Method.PUT.value])
    def reset_password(self, request: dict) -> dict:
        """
        Endpoint to delete user.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """

        with get_session() as session:
            user_id = extract_id_from_url(request["url"], "user")
            user = session.query(User).filter_by(user_id=user_id).first()

            if not user:
                raise ValidationError("User not found", 404)

            if not user.is_password_forgotten:
                raise ValidationError("User did not forget password", 400)

            self.body["password"] = f"{user.user_name[0]}{user.user_surname[0]}{user.user_phone[-4:]}"
            self.body["is_password_forgotten"] = 0

            return super().update(request=request)
