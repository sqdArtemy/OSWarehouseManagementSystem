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
