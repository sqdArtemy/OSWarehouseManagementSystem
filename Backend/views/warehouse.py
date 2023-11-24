from sqlite3 import IntegrityError

from sqlalchemy import func

from db_config import get_session
from models import Warehouse, User, Rack
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities import ValidationError, DatabaseError, decode_token, extract_id_from_url
from utilities.enums.data_related_enums import UserRole
from utilities.enums.method import Method


class WarehouseView(GenericView):
    model = Warehouse
    model_name = "warehouse"

    def __init__(self):
        super().__init__()
        self.company_id = None

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create a new warehouse in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """

        creator = decode_token(self.headers.get("token"))
        supervisor_id = self.body.get("supervisor_id")
        overall_capacity = self.body.get("overall_capacity")
        remaining_capacity = self.body.get("remaining_capacity")

        with get_session() as session:

            company_id = session.query(User.company_id).filter_by(user_id=creator).scalar()

            # Check if the supervisor exists
            supervisor = session.query(User).filter_by(user_id=supervisor_id,
                                                       user_role='supervisor',
                                                       company_id=company_id).first()

            if not supervisor:
                raise ValidationError("supervisor not found", 404)

            # Check if the supervisor is already assigned to another warehouse
            existing_warehouse = session.query(Warehouse).filter_by(supervisor_id=supervisor_id).first()

            if existing_warehouse:
                raise ValidationError("The specified supervisor is already assigned to another warehouse", 400)

            if not remaining_capacity:
                remaining_capacity = overall_capacity

            company_id = session.query(User.company_id).filter_by(user_id=supervisor_id).scalar()

            try:
                # Create a new warehouse
                new_warehouse = Warehouse(
                    warehouse_name=self.body["warehouse_name"],
                    warehouse_address=self.body["warehouse_address"],
                    supervisor_id=supervisor_id,
                    company_id=company_id,
                    overall_capacity=overall_capacity,
                    remaining_capacity=remaining_capacity,
                    warehouse_type=self.body["warehouse_type"]
                )

                session.add(new_warehouse)
                session.commit()

                # Build the response
                response_data = {
                    "status": 201,
                    "data": new_warehouse.to_dict(),
                    "headers": self.headers
                }

                return response_data

            except IntegrityError as e:
                session.rollback()
                raise DatabaseError(str(e))

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update a warehouse in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """

        with get_session() as session:
            # id of warehouse to be modified
            warehouse_id = extract_id_from_url(request["url"], "warehouse")

            updator = decode_token(self.headers.get("token"))
            company_id = session.query(User.company_id).filter_by(user_id=updator).scalar()
            supervisor_id = self.body.get("supervisor_id")
            supervisor = session.query(User).filter_by(user_id=supervisor_id,
                                                              user_role='supervisor',
                                                              company_id=company_id).first()
            if not supervisor:
                raise ValidationError("supervisor not found", 404)

            existing_warehouse = session.query(Warehouse).filter(
                Warehouse.supervisor_id == supervisor_id,
                Warehouse.warehouse_id != warehouse_id
            ).first()
            if existing_warehouse:
                raise ValidationError("The specified supervisor is already assigned to another warehouse", 400)

            # Check if the warehouse exists and belongs to the same company
            warehouse = session.query(Warehouse).filter_by(warehouse_id=warehouse_id, company_id=company_id).first()

            if not warehouse:
                raise ValidationError("Warehouse Not Found", 404)

            overall_capacity = self.body.get("overall_capacity")

            # Calculate the change in capacity
            capacity_change = float(warehouse.overall_capacity) - float(overall_capacity)

            # Check if the overall capacity is being reduced
            if overall_capacity < warehouse.overall_capacity:
                racks_sum = session.query(
                    func.sum(Rack.overall_capacity),
                    func.sum(Rack.remaining_capacity)
                ).filter_by(warehouse_id=warehouse_id).first()
                if racks_sum[0] is not None and overall_capacity < racks_sum[0]:
                    raise ValidationError("Overall capacity cannot be less than the overall capacity in racks", 400)
                elif racks_sum[1] is not None and overall_capacity < racks_sum[1]:
                    raise ValidationError("Overall capacity cannot be less than the remaining capacity in racks", 400)
                elif capacity_change > warehouse.remaining_capacity:
                    raise ValidationError("Overall capacity cannot be less than the remaining capacity", 400)

        # Update warehouse information
        self.body["remaining_capacity"] = warehouse.remaining_capacity - capacity_change
        self.body = warehouse.to_dict()

        return super().update(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.DELETE.value])
    def delete(self, request: dict) -> dict:
        """
        Delete a warehouse in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """

        with get_session() as session:
            # id of warehouse to be deleted
            warehouse_id = extract_id_from_url(request["url"], "warehouse")

            deleter = decode_token(self.headers.get("token"))
            company_id = session.query(User.company_id).filter_by(user_id=deleter).scalar()

            warehouse = session.query(Warehouse).filter_by(warehouse_id=warehouse_id, company_id=company_id).first()

            if not warehouse:
                raise ValidationError("Warehouse Not Found", 404)
            if warehouse.remaining_capacity != warehouse.overall_capacity:
                raise ValidationError("The inventory must be empty to delete the warehouse", 400)

            # Check if there are racks associated with the warehouse
            racks = session.query(Rack).filter_by(warehouse_id=warehouse_id).all()

            # Delete racks if they exist
            for rack in racks:
                session.delete(rack)

            # Delete the warehouse
            session.delete(warehouse)

        response_data = {
            "status": 204,
            "data": {},
            "headers": self.headers
        }

        return response_data

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get(self, request: dict) -> dict:
        """
        Get information about a warehouse including details about its racks.
        :param request: dictionary containing url, method, and headers
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            # id of the warehouse to be retrieved
            warehouse_id = extract_id_from_url(request["url"], "warehouse")

            retriever = decode_token(self.headers.get("token"))
            company_id = session.query(User.company_id).filter_by(user_id=retriever).scalar()

            warehouse = session.query(Warehouse).filter_by(warehouse_id=warehouse_id, company_id=company_id).first()

            if not warehouse:
                raise ValidationError("Warehouse Not Found", 404)

            # Get details about the warehouse
            warehouse_info = {
                "warehouse_id": warehouse.warehouse_id,
                "supervisor_id": warehouse.supervisor_id,
                "warehouse_name": warehouse.warehouse_name,
                "warehouse_address": warehouse.warehouse_address,
                "overall_capacity": warehouse.overall_capacity,
                "remaining_capacity": warehouse.remaining_capacity,
                "warehouse_type": warehouse.warehouse_type,
                "racks": []
            }

            # Get details about racks in the warehouse
            racks = session.query(Rack).filter_by(warehouse_id=warehouse_id).all()

            for rack in racks:
                rack_info = {
                    "rack_id": rack.rack_id,
                    "rack_position": rack.rack_position,
                    "overall_capacity": rack.overall_capacity,
                    "remaining_capacity": rack.remaining_capacity,
                    "ratio": (rack.remaining_capacity / rack.overall_capacity) * 100
                }
                warehouse_info["racks"].append(rack_info)

            response_data = {
                "status": 201,
                "data": warehouse_info,
                "headers": self.headers
            }
            return response_data

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, **kwargs) -> dict:
        """
        Get information about warehouses of a company, optionally filtered by warehouse_name.
        :param request: dictionary containing url, method, headers, and filters
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            requester_id = decode_token(self.headers.get("token"))
            requester = session.query(User).filter(User.user_id == requester_id).first()
            company = requester.company

            if self.requester_role == UserRole.ADMIN.value["code"]:
                return super().get_list(request=request, **kwargs)
            else:
                query = session.query(Warehouse).filter(Warehouse.company_id == company.company_id)
                return super().get_list(request=request, pre_selected_query=query, **kwargs)
