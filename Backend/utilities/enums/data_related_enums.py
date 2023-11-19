from enum import Enum


class UserRole(Enum):
    MANAGER = {"name": "manager", "code": '0'}
    SUPERVISOR = {"name": "supervisor", "code": '1'}
    VENDOR = {"name": "vendor", "code": '2'}
    ADMIN = {"name": "admin", "code": '3'}
