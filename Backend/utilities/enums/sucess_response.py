class SuccessfulResponse:
    def __init__(self, status_code, data, headers):
        self.status_code = status_code
        self.data = data
        self.headers = headers
