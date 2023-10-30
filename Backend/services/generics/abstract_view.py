from abc import ABC, abstractmethod
from db_config import SessionMaker


class AbstractGenericView(ABC):
    """
    Generic CRUD Abstract view for all models.
    """

    def __init__(self):
        self.session = SessionMaker()
        self.instance = None
        self.response = None

    @abstractmethod
    def get(self, request: dict) -> dict:
        pass

    @abstractmethod
    def get_list(self, request: dict, **kwargs) -> dict:
        pass

    @abstractmethod
    def delete(self, request: dict) -> dict:
        pass

    @abstractmethod
    def create(self, request: dict, **kwargs) -> dict:
        pass

    @abstractmethod
    def update(self, request: dict, **kwargs) -> dict:
        pass
