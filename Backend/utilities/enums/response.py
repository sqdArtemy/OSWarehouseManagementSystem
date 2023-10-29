class Response:
    """
    Base class for all responses
    """
    def __init__(self, status_code, headers):
        self.status_code = status_code
        self.headers = headers

    def to_dict(self) -> dict:
        return {
            "status_code": self.status_code,
            "headers": self.headers
        }


class SuccessfulResponse(Response):
    def __init__(self, status_code, data, headers):
        super().__init__(status_code, headers)
        self.data = data

    def to_dict(self) -> dict:
        response_dict = super().to_dict()
        response_dict["body"] = self.data
        return response_dict


class ErrorResponse(Response):
    def __init__(self, status_code, message, headers):
        super().__init__(status_code, headers)
        self.message = message

    def to_dict(self) -> dict:
        response_dict = super().to_dict()
        response_dict["message"] = self.message
        return response_dict
