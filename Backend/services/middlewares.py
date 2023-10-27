
def check_post_method_middleware(function):
    """
    Check if the request method is POST
    :param function: 'Endpoint' function
    """
    def wrapper(*args, **kwargs):
        method = args[0]["method"].upper()

        if method != "POST":
            return {
                "status_code": 405,
                "message": "Method not allowed."
            }

        return function(*args, **kwargs)

    return wrapper
