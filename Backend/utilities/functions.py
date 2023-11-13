import bcrypt
import re

from db_config import SessionMaker
from models import User
from utilities.exceptions import ValidationError


def hash_password(password: str) -> bytes:
    # Hashing password
    slat = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), slat)

    return hashed_password


def check_password(hashed_password: str, input_password: str) -> bool:
    # Checking password
    return bcrypt.checkpw(input_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_token(user_id: int, user_role: str) -> str:
    """
    Creates token with which user can be recognized by the server.
    :param user_id: id of the user
    :param user_role: role of the user
    :return: token
    """
    role_identifier = {
        "owner": "0",
        "manager": "1",
        "shipper": "2",
        "customer": "3"
    }

    return role_identifier.get(user_role) + str(user_id*69 + 420)


def decode_token(token: str) -> int:
    """
    Decodes token and returns user id.
    :param token: encoded token.
    :return: id of the user from database
    """
    if token is None:
        raise ValidationError("Token is not provided.")
    if not token.isalnum():
        raise ValidationError("Token is not valid.")

    user_id = (int(token[1:]) - 420) // 69

    if SessionMaker().query(User).filter_by(user_id=user_id).first() is None:
        raise ValidationError("User with this token does not exist.")

    return user_id


def extract_id_from_url(url: str, model_name: str) -> int | None:
    """
    Extracts id from url.
    :param url: url from which id is extracted
    :param model_name: name of the model in url
    :return: id of the object
    """
    pattern = fr'/{model_name}/(\d+)(?:/|$)'
    match = re.search(pattern, url)

    if match:
        return int(match.group(1))
    else:
        return None
