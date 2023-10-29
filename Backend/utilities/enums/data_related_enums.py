from enum import Enum


class UserRole(Enum):
    OWNER = {"name": "owner", "code": '0'}
    MANAGER = {"name": "manager", "code": '1'}
    SHIPPER = {"name": "shipper", "code": '2'}
    CUSTOMER = {"name": "customer", "code": '3'}
