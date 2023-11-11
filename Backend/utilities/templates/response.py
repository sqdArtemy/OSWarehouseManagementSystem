from utilities.enums.response import SuccessfulResponse, ErrorResponse


class ResponseFactory:
    """
    Factory class for creating responses
    """
    def __init__(self, status_code: int, data: dict, message: str,  headers: dict):
        self.status_code = status_code
        self.data = data
        self.headers = headers
        self.message = message

    def create_response(self) -> dict:
        if self.status_code in range(200, 300):
            return SuccessfulResponse(self.status_code, self.data, self.headers).to_dict()
        else:
            return ErrorResponse(self.status_code, self.message, self.headers).to_dict()
