class ValidationError(Exception):
    """
    Exception for validation errors
    """
    def __init__(self, message: str, status_code: int = 400):
        self.status_code = status_code
        self.message = message
        super().__init__()

    def __str__(self) -> str:
        return self.message


class DatabaseError(Exception):
    """
    Exception for handling database errors
    """
    def __init__(self, message: str):
        self.message = message
        self.status_code = 400
        super().__init__()

    def __str__(self):
        return self.message
