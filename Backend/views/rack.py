from sqlalchemy import func

from db_config import get_session
from models import Rack, User, Warehouse, Inventory, Product
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities import decode_token, ValidationError, extract_id_from_url
from utilities.enums.method import Method


class RackView(GenericView):
    model = Rack
    model_name = "rack"

    @view_function_middleware
    @check_allowed_methods_middleware([Method.DELETE.value])
    def delete(self, request: dict) -> dict:
        """
        Delete product from the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            rack_id = extract_id_from_url(request["url"], "rack")
            rack = session.query(Rack).filter_by(rack_id=rack_id).first()

            deleter = decode_token(self.headers.get("token"))
            deleter = session.query(User).filter_by(user_id=deleter).first()
            warehouse_ids = session.query(Warehouse.warehouse_id).filter_by(company_id=deleter.company_id).all()

            if rack is None or rack.warehouse_id in warehouse_ids:
                raise ValidationError("Rack Not Found", 404)
            if rack.overall_capacity != rack.remaining_capacity:
                raise ValidationError("The inventory must be empty to delete the rack", 404)

            return super().delete(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create a new rack in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """

        with get_session() as session:
            warehouse_id = self.body.get("warehouse_id")
            creator = decode_token(self.headers.get("token"))
            company_id = session.query(User.company_id).filter_by(user_id=creator).scalar()
            warehouse = session.query(Warehouse).filter_by(warehouse_id=warehouse_id, company_id=company_id).first()
            if not warehouse:
                raise ValidationError("Warehouse Not Found", 404)

            rack_position = self.body.get("rack_position")
            rack = session.query(Rack).filter_by(rack_position=rack_position, warehouse_id=warehouse_id).first()
            if rack:
                raise ValidationError("The current position is already used by another rack", 404)

            overall_capacity = self.body.get("overall_capacity")
            racks_sum = session.query(func.sum(Rack.overall_capacity)).filter_by(warehouse_id=warehouse_id).scalar()

            if racks_sum is None:
                racks_sum = 0
            if float(racks_sum) + overall_capacity > warehouse.overall_capacity:
                raise ValidationError(
                    "The overall capacity of all racks cannot exceed the maximum capacity in the warehouse", 404)

            remaining_capacity = self.body.get("remaining_capacity")
            if not remaining_capacity:
                self.body["remaining_capacity"] = overall_capacity

            return super().create(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update a rack in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            rack_id = extract_id_from_url(request["url"], "rack")
            rack = session.query(Rack).filter_by(rack_id=rack_id).first()

            updater_id = decode_token(self.headers.get("token"))
            updater = session.query(User).filter_by(user_id=updater_id).first()
            warehouse_ids = session.query(Warehouse.warehouse_id).filter_by(company_id=updater.company_id).all()

            if rack is None or rack.warehouse_id in warehouse_ids:
                raise ValidationError("Rack Not Found", 404)

            rack_position = self.body.get("rack_position")
            rack_check = session.query(Rack.rack_id).filter_by(rack_position=rack_position,
                                                               warehouse_id=rack.warehouse_id).scalar()
            if rack_check and rack_check != rack_id:
                raise ValidationError("The current position is already used by another rack", 404)

            overall_capacity = self.body.get("overall_capacity")
            capacity_change = float(overall_capacity) - float(rack.overall_capacity)
            warehouse = session.query(Warehouse).filter_by(warehouse_id=rack.warehouse_id).first()

            racks_sum = session.query(func.sum(Rack.overall_capacity)).filter_by(
                warehouse_id=warehouse.warehouse_id).scalar()
            if racks_sum is None:
                racks_sum = 0
            if float(racks_sum) + overall_capacity > warehouse.overall_capacity:
                raise ValidationError(
                    "The overall capacity of all racks cannot exceed the maximum capacity in the warehouse", 404)

            if capacity_change < 0:
                if rack.overall_capacity - rack.remaining_capacity > overall_capacity:
                    raise ValidationError("Overall capacity cannot be less than the remaining capacity", 400)

            request["body"] = {"remaining_capacity": rack.remaining_capacity + capacity_change, **request["body"]}

            return super().update(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def multiple(self, request: dict) -> dict:
        """
        Get information about a warehouse including details about its racks.
        :param request: dictionary containing url, method, and headers
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:

            warehouse_id = self.body.get("warehouse_id")
            creator = decode_token(self.headers.get("token"))
            company_id = session.query(User.company_id).filter_by(user_id=creator).scalar()
            warehouse = session.query(Warehouse).filter_by(warehouse_id=warehouse_id, company_id=company_id).first()
            if not warehouse:
                raise ValidationError("Warehouse Not Found", 404)

            rack_positions = self.body.get("rack_positions")
            for rack_position in rack_positions:
                rack = session.query(Rack).filter_by(rack_position=rack_position, warehouse_id=warehouse_id).first()
                if rack:
                    raise ValidationError("At least one rack with the specified positions already exists", 404)

            fixed_total_capacity = self.body.get("fixed_total_capacity")
            racks_sum = session.query(func.sum(Rack.overall_capacity)).filter_by(warehouse_id=warehouse_id).scalar()

            if racks_sum is None:
                racks_sum = 0
            if float(racks_sum) + fixed_total_capacity > warehouse.overall_capacity:
                raise ValidationError(
                    "The overall capacity of all racks cannot exceed the maximum capacity in the warehouse", 404)

            remaining_capacity_check = session.query(Warehouse.remaining_capacity).filter_by(
                warehouse_id=warehouse_id).scalar()
            if float(remaining_capacity_check) < float(fixed_total_capacity):
                raise ValidationError(
                    "The overall capacity of all racks cannot exceed the maximum capacity in the warehouse", 404)

            overall_capacity = fixed_total_capacity / len(rack_positions)

            for rack_position in rack_positions:
                new_warehouse = Rack(
                    warehouse_id=warehouse_id,
                    rack_position=rack_position,
                    overall_capacity=overall_capacity,
                    remaining_capacity=overall_capacity,
                )
                session.add(new_warehouse)

            session.commit()

            # Get details about racks in the warehouse
            racks = session.query(Rack).filter_by(warehouse_id=warehouse_id).all()
            new_racks = []
            for rack in racks:
                rack_info = {
                    "rack_id": rack.rack_id,
                    "rack_position": rack.rack_position,
                    "overall_capacity": rack.overall_capacity,
                    "remaining_capacity": rack.remaining_capacity,
                    "ratio": (rack.remaining_capacity / rack.overall_capacity) * 100
                }
                new_racks.append(rack_info)

            self.response.status_code = 201
            self.response.data = warehouse.to_dict(cascade_fields=())
            self.response.data["racks"] = new_racks
            return self.response.create_response()
