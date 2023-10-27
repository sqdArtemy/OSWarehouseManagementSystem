import bcrypt


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

    user_id = (int(token[1:]) - 420) // 69

    return user_id
