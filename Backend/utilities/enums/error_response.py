class ErrorResponse:
    def __init__(self, status_code, msg, headers):
        self.status_code = status_code
        self.msg = msg
        self.headers = headers
