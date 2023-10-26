class Request:
    def __init__(self, url, method, headers=None, body=None):
        self.url = url
        self.method = method
        self.headers = headers if headers is not None else {}
        self.body = body if body is not None else {}
