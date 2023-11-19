from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy import select, join

from db_config import SessionMaker
from models import Rack, User, Warehouse, Inventory, Product
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities import decode_token, ValidationError, extract_id_from_url
from utilities.enums.method import Method


class RackView(GenericView):
    model = Rack
    model_name = "rack"

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get(self, request: dict) -> dict:
        """
        Get response with desired product`s dictionary.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """

        rack_id = extract_id_from_url(request["url"], "rack")
        rack = SessionMaker().query(Rack).filter_by(rack_id=rack_id).first()

        retriever_id = decode_token(self.headers.get("token"))
        retriever = SessionMaker().query(User).filter_by(user_id=retriever_id).first()
        warehouse_ids = SessionMaker().query(Warehouse.warehouse_id).filter_by(company_id=retriever.company_id).all()
        if rack is None or rack.warehouse_id in warehouse_ids:
            raise ValidationError("Rack Not Found", 404)

        rack_info = {
            "warehouse_id": rack.warehouse_id,
            "rack_id": rack.rack_id,
            "rack_position": rack.rack_position,
            "overall_capacity": rack.overall_capacity,
            "remaining_capacity": rack.remaining_capacity,
            "inventories": []
        }

        # Execute the query
        inventories = SessionMaker().query(Inventory, Product).filter(Inventory.product_id == Product.product_id).all()

        for inventory, product in inventories:
            inventory_info = {
                "inventory_id": inventory.inventory_id,
                "product_id": inventory.product_id,
                "product_name": product.product_name,
                "quantity": inventory.quantity,
                "total_volume": inventory.quantity * product.volume,
                "arrival_date": inventory.arrival_date.strftime("%Y/%m/%d"),
                "expiry_date": inventory.expiry_date.strftime("%Y/%m/%d")
            }
            rack_info["inventories"].append(inventory_info)

        response_data = {
            "status": 201,
            "data": rack_info,
            "headers": self.headers
        }
        return response_data

    @view_function_middleware
    @check_allowed_methods_middleware([Method.DELETE.value])
    def delete(self, request: dict) -> dict:
        """
        Delete product from the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """

        rack_id = extract_id_from_url(request["url"], "rack")
        rack = SessionMaker().query(Rack).filter_by(rack_id=rack_id).first()

        deleter = decode_token(self.headers.get("token"))
        deleter = SessionMaker().query(User).filter_by(user_id=deleter).first()
        warehouse_ids = SessionMaker().query(Warehouse.warehouse_id).filter_by(company_id=deleter.company_id).all()

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

        warehouse_id = self.body.get("warehouse_id")
        creator = decode_token(self.headers.get("token"))
        company_id = SessionMaker().query(User.company_id).filter_by(user_id=creator).scalar()
        warehouse = SessionMaker().query(Warehouse).filter_by(warehouse_id=warehouse_id, company_id=company_id).first()
        if not warehouse:
            raise ValidationError("Warehouse Not Found", 404)

        rack_position = self.body.get("rack_position")
        rack = SessionMaker().query(Rack).filter_by(rack_position=rack_position, warehouse_id=warehouse_id).first()
        if rack:
            raise ValidationError("The current position is already used by another rack", 404)

        overall_capacity = self.body.get("overall_capacity")
        racks_sum = SessionMaker().query(func.sum(Rack.overall_capacity)).filter_by(warehouse_id=warehouse_id).scalar()

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
        rack_id = extract_id_from_url(request["url"], "rack")
        rack = SessionMaker().query(Rack).filter_by(rack_id=rack_id).first()

        updater_id = decode_token(self.headers.get("token"))
        updater = SessionMaker().query(User).filter_by(user_id=updater_id).first()
        warehouse_ids = SessionMaker().query(Warehouse.warehouse_id).filter_by(company_id=updater.company_id).all()

        if rack is None or rack.warehouse_id in warehouse_ids:
            raise ValidationError("Rack Not Found", 404)

        rack_position = self.body.get("rack_position")
        rack_check = SessionMaker().query(Rack.rack_id).filter_by(rack_position=rack_position,
                                                                  warehouse_id=rack.warehouse_id).scalar()
        if rack_check and rack_check != rack_id:
            raise ValidationError("The current position is already used by another rack", 404)

        overall_capacity = self.body.get("overall_capacity")
        capacity_change = float(overall_capacity) - float(rack.overall_capacity)
        warehouse = SessionMaker().query(Warehouse).filter_by(warehouse_id=rack.warehouse_id).first()

        racks_sum = SessionMaker().query(func.sum(Rack.overall_capacity)).filter_by(
            warehouse_id=warehouse.warehouse_id).scalar()
        if racks_sum is None:
            racks_sum = 0
        if float(racks_sum) + overall_capacity > warehouse.overall_capacity:
            raise ValidationError(
                "The overall capacity of all racks cannot exceed the maximum capacity in the warehouse", 404)

        if capacity_change < 0:
            if rack.remaining_capacity > overall_capacity:
                raise ValidationError("Overall capacity cannot be less than the remaining capacity", 400)

        self.body["remaining_capacity"] = rack.remaining_capacity + capacity_change

        return super().update(request=request)
