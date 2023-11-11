from utilities import extract_id_from_url
from utilities.templates import ResponseFactory


def check_allowed_methods_middleware(allowed_methods):
    """
    Check if the request method is one of the allowed methods.
    :param allowed_methods: List of allowed methods
    """
    def decorator(function):
        def wrapper(*args, **kwargs):
            body = args[0]

            if type(body) is dict:
                method = body.get("method", "").upper()
            else:
                method = body.method.upper()

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
            request = kwargs["request"]
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


def view_function_middleware(function):
    """
    Decorator for view functions.
    """
    def wrapper(*args, **kwargs):
        instance = args[0]
        request = kwargs["request"]
        instance.request = request
        instance.headers = request.get("headers", {})
        instance.body = request.get("body", {})
        instance.url = request.get("url", "")
        instance.method = request.get("method", "")
        instance.instance_id = extract_id_from_url(instance.url, instance.model_name)

        instance.instance = instance.session.query(instance.model).filter(
            getattr(instance.model, f"{instance.model_name}_id") == instance.instance_id
        ).first() if instance.instance_id is not None else None
        instance.response = ResponseFactory(400, {}, "", instance.headers)

        return function(*args, **kwargs)

    return wrapper
