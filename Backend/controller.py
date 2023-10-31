from views import UserView
from services import ValidationError, DatabaseError
from utilities.templates import ResponseFactory
from utilities.enums.method import Method


def controller(request: dict) -> dict:
    """
    Controller for handling requests and processing response.
    :param request:
    :return:
    """

    user_view = UserView()
    headers = request.get("headers", {})
    url = request.get("url", "")
    method = request.get("method", "")
    response = ResponseFactory(status_code=400, data={}, message="", headers=headers)

    try:
        if "/user" in url:
            if method == Method.GET.value:
                if "/users" in url:
                    return user_view.get_list(request)
                else:
                    return user_view.get(request)
            elif method == Method.POST.value:
                return user_view.sign_up(request)
            elif method == Method.DELETE.value:
                return user_view.delete(request)
            elif method == Method.PUT.value:
                return user_view.update(request)
    except (ValidationError, DatabaseError) as e:
        response.status_code = e.status_code
        response.message = e.message
        return response.create_response()
