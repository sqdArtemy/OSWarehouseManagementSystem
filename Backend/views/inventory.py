from datetime import datetime, timedelta
from sqlalchemy import func, or_, and_, desc, text, cast, Float, null

from db_config import get_session
from models import Inventory, User, Warehouse, Rack, Product, ThrownItem
from services import view_function_middleware, check_allowed_methods_middleware, check_allowed_roles_middleware
from services.generics import GenericView
from utilities import decode_token, ValidationError
from utilities.enums.data_related_enums import UserRole
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

            total_volume_init = product.volume * quantity
            if rack.remaining_capacity < total_volume_init:
                raise ValidationError("Not enough capacity", 400)

            products_from_rack = session.query(Inventory.product_id).filter_by(rack_id=rack_id).all()
            if products_from_rack:
                for product_from_rack in products_from_rack:
                    is_stackable = session.query(Product.is_stackable).filter_by(
                        product_id=product_from_rack[0]).scalar()
                    if not is_stackable:
                        raise ValidationError("Non stackable product is already occupying this rack", 400)

            is_stackable = session.query(Product.is_stackable).filter_by(
                product_id=product_id).scalar()

            if is_stackable == 0 and len(products_from_rack) != 0:
                raise ValidationError("Cannot stack non-stackable product", 400)

            if warehouse.warehouse_type != product.product_type:
                raise ValidationError(
                    f"Product with type {product.product_type} cannot be put to the warehouse for {warehouse.warehouse_type} products",
                    400)

            inventory = session.query(Inventory).filter_by(rack_id=rack_id, product_id=product_id).first()
            if inventory:
                quantity = quantity + inventory.quantity
                total_volume = total_volume_init + inventory.total_volume

                update_data = {"quantity": quantity, "total_volume": total_volume}
                session.query(Inventory).filter_by(rack_id=rack_id, product_id=product_id).update(update_data)

            else:
                new_inventory = Inventory(
                    rack_id=rack_id,
                    product_id=product_id,
                    quantity=quantity,
                    total_volume=total_volume_init,
                    company_id=null,
                    arrival_date=datetime.now(),
                    expiry_date=datetime.now() + timedelta(days=product.expiry_duration),
                )

                session.add(new_inventory)

            session.flush()

            rack = session.query(Rack).filter_by(rack_id=rack_id).first()
            session.query(Rack).filter_by(rack_id=rack_id).update(
                {"remaining_capacity": rack.remaining_capacity - total_volume_init})

            warehouse = session.query(Warehouse).filter_by(warehouse_id=warehouse.warehouse_id).first()
            session.query(Warehouse).filter_by(warehouse_id=warehouse.warehouse_id).update(
                {"remaining_capacity": warehouse.remaining_capacity - total_volume_init})

            session.commit()

            self.response.status_code = 201
            self.response.data = rack.to_dict()
            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.DELETE.value])
    def delete(self, request: dict) -> dict:
        """
        Update an inventory in the database.
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

            inventory = session.query(Inventory).filter_by(rack_id=rack_id, product_id=product_id).first()
            if not inventory:
                raise ValidationError("Inventory Not Found", 404)

            diff = inventory.quantity - quantity
            changed_volume = product.volume * quantity
            if diff < 0:
                raise ValidationError("This rack does not have the specified amount of goods", 404)

            if diff == 0:
                session.delete(inventory)
            else:
                session.query(Inventory).filter_by(rack_id=rack_id, product_id=product_id).update({"quantity": diff,
                                                                                                   "total_volume": inventory.total_volume - changed_volume})

            new_thrown_item = ThrownItem(
                product_id=product_id,
                warehouse_id=warehouse.warehouse_id,
                quantity=quantity,
                created_at=datetime.now()
            )

            session.add(new_thrown_item)
            session.flush()

            rack = session.query(Rack).filter_by(rack_id=rack_id).first()
            session.query(Rack).filter_by(rack_id=rack_id).update(
                {"remaining_capacity": rack.remaining_capacity + changed_volume})

            warehouse = session.query(Warehouse).filter_by(warehouse_id=warehouse.warehouse_id).first()
            session.query(Warehouse).filter_by(warehouse_id=warehouse.warehouse_id).update(
                {"remaining_capacity": warehouse.remaining_capacity + changed_volume})

            session.commit()

            self.response.status_code = 200
            self.response.data = rack.to_dict()
            return self.response.create_response()

    @view_function_middleware
    @check_allowed_roles_middleware([UserRole.MANAGER.value["code"],
                                     UserRole.ADMIN.value["code"],
                                     UserRole.SUPERVISOR.value["code"]])
    @check_allowed_methods_middleware([Method.GET.value])
    def group_inventory_by_product(self, request: dict, **kwargs) -> dict:
        """
        Group inventory by product.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        with (get_session() as session):
            # if there is filter by warehouse_id
            warehouse_id = kwargs.get("warehouse_id")

            result = session.query(Inventory.product_id, Product.product_name,
                                   func.count(Inventory.product_id).label("products_number"),
                                   cast(func.sum(Inventory.total_volume).label("total_volume_sum"), Float),
                                   cast(
                                       func.avg(func.datediff(Inventory.expiry_date, Inventory.arrival_date)),
                                       Float
                                   ).label("average_expiry_date"),
                                   ).join(Product).group_by(Inventory.product_id)

            # if admin - return everything
            if self.requester_role == UserRole.ADMIN.value["code"]:
                result = result.all()

            # if manager - return all warehouses
            if self.requester_role == UserRole.MANAGER.value["code"]:
                manager = session.query(User).filter_by(user_id=self.requester_id).first()
                wh_ids = session.query(Warehouse.warehouse_id).filter_by(company_id=manager.company_id).all()
                if warehouse_id:
                    wh_ids = session.query(Warehouse.warehouse_id).filter_by(warehouse_id=warehouse_id).all()
                rack_ids = session.query(Rack.rack_id).filter(Rack.warehouse_id.in_([i[0] for i in wh_ids])).all()
                result = result.filter(Inventory.rack_id.in_([j[0] for j in rack_ids])).all()

            # if supervisor - return only his warehouse
            if self.requester_role == UserRole.SUPERVISOR.value["code"]:
                warehouse = session.query(Warehouse).filter_by(supervisor_id=self.requester_id).first()
                rack_ids = session.query(Rack.rack_id).filter_by(warehouse_id=warehouse.warehouse_id).all()
                result = result.filter(Inventory.rack_id.in_([j[0] for j in rack_ids])).all()

            data = list()
            for res in result:
                data.append({
                    "product_id": res[0],
                    "product_name": res[1],
                    "products_number": res[2],
                    "total_volume_sum": res[3],
                    "average_expiry_date": res[4],
                })

            self.response.status_code = 200
            self.response.data = data
            return self.response.create_response()
