from sqlalchemy.exc import IntegrityError

from models import User, Company
from db_config import get_session, SessionMaker
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
        if self.body["user_role"] not in ("owner", "customer"):
            raise ValidationError("Only warehouse owner or customers can register to the service.")

        # Check if password and confirm_password are the same
        if self.body["password"] != self.body["confirm_password"]:
            raise ValidationError("Password and confirm password are not the same.")

        if not is_email_valid(self.body["user_email"]):
            raise ValidationError("Invalid email address.")

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
                    company_id=new_company_id
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
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        # Check if requested user is the same as the one that should be updated or if the requester is owner of the
        # company where user is located
        requester_id = decode_token(self.headers.get("token"))
        requester = SessionMaker().query(User).filter_by(user_id=requester_id).first()

        if self.instance_id != requester_id and (
                self.instance.company_id != requester.company_id or requester.user_role != UserRole.OWNER.value["name"]
        ):
            raise ValidationError(status_code=401, message="You can not update data of this user.")

        # Remove password if it was passed
        if "user_password" in self.body:
            del self.body["user_password"]

        return super().update(request=request)

    @view_function_middleware
    @check_allowed_roles_middleware([UserRole.OWNER.value["code"]])
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        'Endpoint' to create a new employee for a company. Can be used only by the owner of the company.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """

        # Get owner id from token and retrieve owner`s company
        owner_id = decode_token(self.headers.get("token"))
        company = SessionMaker().query(User).filter_by(user_id=owner_id).first().company
        company_id = company.company_id
        company_name = company.company_name

        # Autogenerate password from data
        employee_name = self.body["user_name"]
        employee_email = self.body["user_email"]
        employee_surname = self.body["user_surname"]
        employee_phone = self.body["user_phone"]
        employee_role = self.body["user_role"]
        password = f"{company_name[0]}{employee_name[0]}{employee_surname[0]}{employee_phone[1:5]}"

        # Validating fields
        if employee_role not in (UserRole.MANAGER.value["name"], UserRole.SHIPPER.value["name"]):
            raise ValidationError("Only managers or shippers can be added to the company.")

        if not is_email_valid(employee_email):
            raise ValidationError("Invalid email address.")

        if not is_phone_valid(employee_phone):
            raise ValidationError("Invalid phone number.")

        # Checking if user already exists or not
        if is_instance_already_exists(User, user_email=self.body["user_email"]):
            raise DatabaseError("User email is already registered.")

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
    @check_allowed_methods_middleware([Method.DELETE.value])
    def delete(self, request: dict) -> dict:
        """
        Endpoint to delete user.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """

        # define objects
        id_to_del = extract_id_from_url(request["url"], "user")
        user_to_del = SessionMaker().query(User).filter_by(user_id=id_to_del).first()
        user_id = decode_token(self.headers.get("token"))
        user = SessionMaker().query(User).filter_by(user_id=user_id).first()
        user_role = user.user_role

        # check if user is owner
        if user_role != UserRole.OWNER.value["name"]:
            raise ValidationError("Forbidden", 403)

        # check if there is user_to_be_deleted in DB and
        # is from the same company as the user who wants to delete
        if not user_to_del or user_to_del.company_id != user.company_id:
            raise ValidationError("User Not Found", 404)

        # set null if manager has warehouse
        elif user_to_del.user_role == UserRole.MANAGER.value["name"]:
            for warehouse in user_to_del.warehouses:
                warehouse.manager = None
            user_to_del.warehouses = []
            SessionMaker().commit()

        # cannot delete shipper if he has active orders or transactions
        else:
            has_trans_or_orders = False
            for order in user_to_del.orders:
                if order.order_status == "processing":
                    has_trans_or_orders = True
                    break

            for transaction in user_to_del.transactions:
                if transaction.status == "processing":
                    has_trans_or_orders = True
                    break

            if user_to_del.user_role == UserRole.SHIPPER.value["name"] and has_trans_or_orders:
                raise ValidationError("The shipper cannot be deleted during active orders and transactions")

        # empty body
        request["body"] = self.body = dict()

        return super().delete(request=request)
