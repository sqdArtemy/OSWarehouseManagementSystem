import bcrypt


def hash_password(password: str) -> bytes:
    # Hashing password
    slat = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), slat)

    return hashed_password


def check_password(hashed_password: bytes, input_password: str) -> bool:
    # Checking password
    return bcrypt.checkpw(input_password.encode("utf-8"), hashed_password)
