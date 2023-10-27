from sqlalchemy.exc import IntegrityError
from models import User, Company
from db_config import get_session
from utilities import hash_password, is_email_valid, is_phone_valid, create_token, check_password
from services import check_allowed_methods_middleware
from utilities.enums.method import Method
from .company import create_company, is_company_already_exists


@check_allowed_methods_middleware([Method.POST.value])
def sign_up(request: dict) -> dict:
    """
    'Endpoint' to create a new user along with the company
    :param request: dictionary containing url, method and body
    :return: dictionary containing status_code and response body
    """
    body = request["body"]

    # Check if user role is valid
    if body["user_role"] not in ("owner", "customer"):
        return {
            "status_code": 400,
            "message": "Only warehouse owner or customers can register to the service."
        }

    # Check if password and confirm_password are the same
    if body["password"] != body["confirm_password"]:
        return {
            "status_code": 400,
            "message": "Password and confirm password are not the same."
        }

    if not is_email_valid(body["user_email"]):
        return {
            "status_code": 400,
            "message": "Invalid email address."
        }

    if not is_phone_valid(body["user_phone"]):
        return {
            "status_code": 400,
            "message": "Invalid phone number."
        }

    if is_company_already_exists(body["company_email"]):
        return {
            "status_code": 400,
            "message": "Company with given email already exists."
        }

    # Creation of new company
    new_company_id = create_company(
        {
            "company_name": body["company_name"],
            "company_email": body["company_email"]
        }
    )

    try:
        with get_session() as session:
            # Creation of new user
            new_user = User(
                user_name=body["user_name"],
                user_surname=body["user_surname"],
                user_email=body["user_email"],
                user_role=body["user_role"],
                user_phone=body["user_phone"],
                user_password=hash_password(body["password"]).decode("utf8"),
                company_id=new_company_id
            )
            session.add(new_user)
            session.commit()

            return {
                "status_code": 201,
                "body": new_user.to_dict(),
                "token": create_token(new_user.user_id, new_user.user_role)
            }

    except IntegrityError:
        session.rollback()
        session.delete(session.query(Company).filter_by(company_id=new_company_id).first())
        session.commit()

        # Check if user email is already registered
        if session.query(User).filter_by(user_email=body["user_email"]).first():
            return {
                "status_code": 400,
                "message": "User email is already registered."
            }


@check_allowed_methods_middleware([Method.POST.value])
def login(request: dict) -> dict:
    """
    'Endpoint' to login user.
    :param request: dictionary containing url, method and body
    :return: dictionary containing status_code and response body
    """
    body = request["body"]

    if not is_email_valid(body["user_email"]):
        return {
            "status_code": 400,
            "message": "Invalid email address."
        }

    with get_session() as session:
        user = session.query(User).filter_by(user_email=body["user_email"]).first()

        if not user or not check_password(user.user_password, body["password"]):
            return {
                "status_code": 400,
                "message": "Wrong credentials."
            }

        return {
            "status_code": 200,
            "body": user.to_dict(),
            "token": create_token(user.user_id, user.user_role)
        }
