from datetime import datetime, timedelta
from typing import Dict, Any, List

from db_config import get_session
from models import Inventory, User, Warehouse, Rack, Product
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities import decode_token, ValidationError
from utilities.enums.method import Method


class InventoryView(GenericView):
    model = Inventory
    model_name = "inventory"

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create a new inventory in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """

        with get_session() as session:
            rack_id = self.body.get("rack_id")
            product_id = self.body.get("product_id")
            quantity = self.body.get("quantity")

            creator_id = decode_token(self.headers.get("token"))
            warehouse = session.query(Warehouse).filter_by(supervisor_id=creator_id).first()
            company_id = session.query(User.company_id).filter_by(user_id=creator_id).scalar()

            rack = session.query(Rack).filter_by(rack_id=rack_id, warehouse_id=warehouse.warehouse_id).first()
            if not rack:
                raise ValidationError("Rack Not Found", 404)

            product = session.query(Product).filter_by(product_id=product_id, company_id=company_id).first()
            if not product:
                raise ValidationError("Product Not Found", 404)

            total_volume = product.volume * quantity
            if rack.remaining_capacity < total_volume:
                raise ValidationError("Not enough capacity", 400)

            products_from_rack = session.query(Inventory.product_id).filter_by(rack_id=rack_id).all()
            if products_from_rack:
                for product_from_rack in products_from_rack:
                    is_stackable = session.query(Product.is_stackable).filter_by(product_id=product_from_rack[0]).scalar()
                    if not is_stackable:
                        raise ValidationError("Non stackable product is already occupying this rack", 400)

            if warehouse.warehouse_type != product.product_type:
                raise ValidationError(f"Product with type {product.product_type} cannot be put to the warehouse for {warehouse.warehouse_type} products", 400)

            inventory = session.query(Inventory).filter_by(rack_id=rack_id, product_id=product_id).first()
            if inventory:
                quantity = quantity + inventory.quantity
                total_volume = total_volume + inventory.total_volume

                update_data = {"quantity": quantity, "total_volume": total_volume}
                session.query(Inventory).filter_by(rack_id=rack_id, product_id=product_id).update(update_data)

            else:
                new_inventory = Inventory(
                    rack_id=rack_id,
                    product_id=product_id,
                    quantity=quantity,
                    total_volume=total_volume,
                    arrival_date=datetime.now(),
                    expiry_date=datetime.now() + timedelta(days=product.expiry_duration),
                )

                session.add(new_inventory)

            session.flush()

            rack = session.query(Rack).filter_by(rack_id=rack_id).first()
            session.query(Rack).filter_by(rack_id=rack_id).update({"remaining_capacity": rack.remaining_capacity - quantity})

            warehouse = session.query(Warehouse).filter_by(warehouse_id=warehouse.warehouse_id).first()
            session.query(Warehouse).filter_by(warehouse_id=warehouse.warehouse_id).update({"remaining_capacity": warehouse.remaining_capacity - quantity})

            session.commit()

            rack_info = {
                    "warehouse_id": warehouse.warehouse_id,
                    "rack_id": rack.rack_id,
                    "rack_position": rack.rack_position,
                    "overall_capacity": rack.overall_capacity,
                    "remaining_capacity": rack.remaining_capacity,
                    "inventories": []
                }

            inventories = session.query(Inventory, Product).filter(Inventory.product_id == Product.product_id).all()

            for inventory, product in inventories:
                inventory_info = {
                    "inventory_id": inventory.inventory_id,
                    "product_id": inventory.product_id,
                    "product_name": product.product_name,
                    "quantity": inventory.quantity,
                    "total_volume": (product.volume * inventory.quantity),
                    "arrival_date": inventory.arrival_date.strftime("%Y-%m-%d"),
                    "expiry_date": inventory.expiry_date.strftime("%Y-%m-%d"),
                }
                rack_info["inventories"].append(inventory_info)

            response_data = {
                "status": 201,
                "data": rack_info,
                "headers": self.headers
            }
            return response_data

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update an inventory in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        # TODO: Add checkers and validations
        return super().update(request=request)
