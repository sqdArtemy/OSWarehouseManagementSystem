def check_allowed_methods_middleware(allowed_methods):
    """
    Check if the request method is one of the allowed methods.
    :param allowed_methods: List of allowed HTTP methods
    """
    def decorator(function):
        def wrapper(*args, **kwargs):
            request = args[0]
            method = request.get("method", "").upper()

            if method not in allowed_methods:
                return {
                    "status_code": 405,
                    "message": "Method not allowed."
                }

            return function(*args, **kwargs)

        return wrapper

    return decorator


def check_allowed_roles_middleware(allowed_roles):
    """
    Check if the user role is one of the allowed roles.
    :param allowed_roles: List of allowed roles
    """
    def decorator(function):
        def wrapper(*args, **kwargs):
            request = args[0]
            headers = request.get("headers", {})
            token = headers.get("token", None)

            if not token:
                return {
                    "status_code": 401,
                    "message": "Unauthorized."
                }

            user_role = token[0]

            if user_role not in allowed_roles:
                return {
                    "status_code": 403,
                    "message": "Forbidden."
                }

            return function(*args, **kwargs)

        return wrapper

    return decorator
