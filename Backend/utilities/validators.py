import re
from db_config import get_session


def is_email_valid(email: str) -> bool:
    """
    Check if email is valid
    :param email: email to be checked
    :return: True in case of valid email, False otherwise
    """
    email_regexp_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    return re.match(email_regexp_pattern, email) is not None


def is_phone_valid(phone_number: str) -> bool:
    """
    Check if phone number is valid
    :param phone_number: phone number to be checked
    :return: True in case of valid phone number, False otherwise
    """
    phone_regexp_pattern = r'^\+?[0-9]{9,15}$'

    return re.match(phone_regexp_pattern, phone_number) is not None


def is_instance_already_exists(model, **kwargs) -> bool:
    """
    Check if instance of given model already exists in database.
    :param model: model to be checked
    :param kwargs: arguments to be checked
    :return: True in case of existing instance, False otherwise
    """
    with get_session() as session:
        return session.query(model).filter_by(**kwargs).first() is not None
