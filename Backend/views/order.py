from datetime import datetime, timedelta
from math import floor
from typing import Dict, List, Any

from sqlalchemy import func, or_, and_, desc

from db_config import get_session
from models import Order, Transport, OrderItem, Product, Vendor, Warehouse, User, Inventory, Rack
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities import ValidationError, is_instance_already_exists, extract_id_from_url, decode_token
from utilities.enums.data_related_enums import UserRole
from utilities.enums.method import Method


class OrderView(GenericView):
    model = Order
    model_name = "order"

    @staticmethod
    def __get_remaining_volume(warehouse_id: int) -> float:
        """
        Get remaining volume of a warehouse.
        """
        with get_session() as session:
            remaining_volume = (
                session.query(
                    Warehouse.remaining_capacity - func.coalesce(
                        func.sum(OrderItem.quantity * Product.volume),
                        0
                    )
                )
                .join(Order, Order.recipient_id == Warehouse.warehouse_id)
                .join(OrderItem, OrderItem.order_id == Order.order_id)
                .join(Product, Product.product_id == OrderItem.product_id)
                .filter(Order.order_status.in_(["processing", "delivered", "submitted"]))
                .filter(Warehouse.warehouse_id == warehouse_id)
            ).scalar()

            return remaining_volume

    @staticmethod
    def __get_remaining_products(warehouse_id: int) -> list[tuple]:
        """
        Get remaining products of a warehouse.
        """
        with get_session() as session:
            remaining_products = (
                session.query(
                    Inventory.product_id,
                    func.sum(Inventory.quantity).label('remaining_quantity')
                )
                .join(Rack, Inventory.rack_id == Rack.rack_id)
                .filter(Rack.warehouse_id == warehouse_id)
                .group_by(Inventory.product_id)
            ).all()

            return remaining_products

    def __is_warehouse_capacity_enough(self, warehouse_id: int, total_volume: float) -> bool:
        """
        Check if warehouse capacity is enough.
        """
        remaining_volume = self.__get_remaining_volume(warehouse_id)
        return remaining_volume >= total_volume

    def __are_warehouse_products_enough(self, warehouse_id: int, products_to_order: dict) -> bool:
        """
        Check if warehouse products are enough.
        """
        remaining_products = self.__get_remaining_products(warehouse_id)

        for product_id, quantity in products_to_order.items():
            for remaining_product in remaining_products:
                if product_id == remaining_product[0]:
                    if quantity > remaining_product[1]:
                        return False

        return True

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get(self, request: dict) -> dict:
        """
        Get an order from the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        requester_role = self.requester_role
        requester_id = self.requester_id
        order = self.instance
        requester_warehouses = []
        requester_vendors = []

        if order is None:
            raise ValidationError(f"{self.model_name.capitalize()} with given id does not exist.", 404)

        with get_session() as session:
            requester = session.query(User).filter_by(user_id=requester_id).first()

            if self.requester_role == UserRole.SUPERVISOR.value["code"]:
                requester_warehouses = session.query(Warehouse.warehouse_id).filter_by(
                    supervisor_id=requester_id).all()
                requester_warehouses = [warehouse[0] for warehouse in requester_warehouses]
            else:
                requester_warehouses = session.query(Warehouse.warehouse_id).filter_by(
                    company_id=requester.company.company_id).all()
                requester_warehouses = [warehouse[0] for warehouse in requester_warehouses]

            if requester_role != UserRole.ADMIN.value["code"] and (
                    (
                            requester_role == UserRole.VENDOR.value["code"] and (
                            (order.order_type == "from_warehouse" and order.recipient_id not in requester_vendors) or
                            (order.order_type == "to_warehouse" and order.supplier_id not in requester_vendors)
                    )
                    ) or (
                            (requester_role in (UserRole.MANAGER.value["code"], UserRole.SUPERVISOR.value["code"])) and (
                            (order.order_type == "to_warehouse" and order.recipient_id not in requester_warehouses) or
                            (order.order_type == "from_warehouse" and order.supplier_id not in requester_warehouses)
                            )
                    )
            ):
                raise ValidationError("You are not allowed to see this order.", 403)

            total_volume = session.query(func.sum(OrderItem.quantity * Product.volume)). \
                join(Product, OrderItem.product_id == Product.product_id). \
                filter(OrderItem.order_id == order.order_id).scalar()

            self.response.status_code = 200
            self.response.data = order.to_dict(cascade_fields=("supplier", "recipient"))
            self.response.data["total_volume"] = total_volume
            self.response.data["items"] = [
                order_item.to_dict(cascade_fields=()) for order_item in order.ordered_items
            ]

            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, **kwargs) -> dict:
        """
        Get all orders from the database depending on requester`s role.
        :param request: dictionary containing url, method, body and headers
        :param kwargs: arguments to be checked, here you need to pass fields on which instances will be filtered
        :return: dictionary containing status_code and response body with list of dictionaries of order`s data
        """
        if self.requester_role == UserRole.ADMIN.value["code"]:
            return super().get_list(request=request, cascade_fields=("supplier", "recipient"), **kwargs)

        with get_session() as session:
            requester = session.query(User).filter_by(user_id=self.requester_id).first()
            orders = None

            if self.requester_role in (UserRole.SUPERVISOR.value["code"], UserRole.MANAGER.value["code"]):
                if self.requester_role == UserRole.SUPERVISOR.value["code"]:
                    warehouse_ids = session.query(Warehouse.warehouse_id).filter_by(
                        supervisor_id=self.requester_id).all()
                    warehouse_ids = [warehouse[0] for warehouse in warehouse_ids]
                else:
                    warehouse_ids = session.query(Warehouse.warehouse_id).filter_by(
                        company_id=requester.company.company_id).all()
                    warehouse_ids = [warehouse[0] for warehouse in warehouse_ids]

                orders = session.query(Order).filter(
                    or_(
                        and_(Order.order_type == "from_warehouse", Order.supplier_id.in_(warehouse_ids)),
                        and_(Order.order_type == "to_warehouse", Order.recipient_id.in_(warehouse_ids))
                    )
                )

            elif self.requester_role == UserRole.VENDOR.value["code"]:
                vendor_ids = session.query(Vendor.vendor_id).filter_by(vendor_owner_id=requester.user_id).all()
                vendor_ids = [vendor[0] for vendor in vendor_ids]

                orders = session.query(Order).filter(
                    or_(
                        and_(Order.order_type == "to_warehouse", Order.supplier_id.in_(vendor_ids)),
                        and_(Order.order_type == "from_warehouse", Order.recipient_id.in_(vendor_ids))
                    )
                )
            return super().get_list(
                request=request, cascade_fields=("supplier", "recipient"),
                pre_selected_query=orders.order_by(desc(Order.created_at)), **kwargs
            )

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create a new order in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        requester_role = self.requester_role
        order_items = self.body.get("items")
        order_type = self.body.get("order_type")
        vendor_id = self.body.get("vendor_id")
        warehouse_id = self.body.get("warehouse_id")
        total_volume = 0
        total_price = 0
        products_to_order = {}
        product_ids = []

        if requester_role not in (UserRole.ADMIN.value["code"], UserRole.VENDOR.value["code"]):
            raise ValidationError("Only vendor can create an order.", 403)

        if order_type not in ("from_warehouse", "to_warehouse"):
            raise ValidationError("Order type must be 'from_warehouse' or 'to_warehouse'.", 400)

        if len(order_items) == 0:
            raise ValidationError("Order must contain at least one item.", 400)

        if not is_instance_already_exists(Vendor, vendor_id=vendor_id):
            raise ValidationError(f"Vendor with id {vendor_id} does not exist.", 404)

        if not is_instance_already_exists(Warehouse, warehouse_id=warehouse_id):
            raise ValidationError(f"Warehouse with id {warehouse_id} does not exist.", 404)

        with get_session() as session:
            vendor = session.query(Vendor).filter_by(vendor_id=vendor_id).first()
            main_product_type = session.query(Product.product_type). \
                filter_by(product_id=order_items[0]["product_id"]).scalar()

            for item in order_items:
                product_id, quantity = item.get("product_id"), item.get("quantity")

                if not is_instance_already_exists(Product, product_id=product_id):
                    raise ValidationError(f"Product with id {product_id} does not exist", 404)

                product = session.query(Product).filter_by(product_id=product_id).first()
                total_volume += product.volume * quantity
                products_to_order[product_id] = quantity
                product_ids.append(product_id)

                if not vendor.is_government:
                    total_price += product.price * quantity

                if product.product_type != main_product_type:
                    raise ValidationError("All products must be of the same type", 400)

            if order_type == "to_warehouse":
                if not self.__is_warehouse_capacity_enough(warehouse_id, total_volume):
                    raise ValidationError("Warehouse capacity is not enough.", 400)
            elif order_type == "from_warehouse":
                if not self.__are_warehouse_products_enough(warehouse_id, products_to_order):
                    raise ValidationError("Warehouse does not have enough products.", 400)

            order = Order(
                supplier_id=vendor_id if order_type == "to_warehouse" else warehouse_id,
                recipient_id=warehouse_id if order_type == "to_warehouse" else vendor_id,
                order_type=order_type,
                order_status="new",
                total_price=total_price,
                created_at=datetime.now())

            session.add(order)
            session.flush()

            for product_id, quantity in products_to_order.items():
                order_item = OrderItem(
                    order_id=order.order_id,
                    product_id=product_id,
                    quantity=quantity
                )
                session.add(order_item)
            session.commit()

            self.response.status_code = 201
            self.response.data = order.to_dict(cascade_fields=())
            self.response.data["items"] = [
                order_item.to_dict(cascade_fields=()) for order_item in order.ordered_items
            ]
            self.response.data["total_volume"] = total_volume

            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update an order in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """

        order_items = self.body.get("items")
        vendor_id = self.body.get("vendor_id")
        requester_role = self.requester_role
        order = self.instance
        warehouse_id = order.supplier_id if order.order_type == "from_warehouse" else order.recipient_id
        old_items = order.ordered_items
        total_volume = 0
        total_price = 0
        products_to_order = {}
        product_ids = []

        if order is None:
            raise ValidationError(f"{self.model_name.capitalize()} with given id does not exist.", 404)

        if requester_role not in (UserRole.ADMIN.value["code"], UserRole.VENDOR.value["code"]):
            raise ValidationError("Only vendor can update an order.", 403)

        if order.order_status != "new":
            raise ValidationError(f"You can not update order in status '{order.order_status}'", 403)

        if (order.order_type == "to_warehouse" and order.supplier_id != vendor_id) or (
                order.order_type == "from_warehouse" and order.recipient_id != vendor_id):
            raise ValidationError("Order not found", 404)

        if len(order_items) == 0:
            raise ValidationError("Order must contain at least one item.", 400)

        with get_session() as session:
            vendor = session.query(Vendor).filter_by(vendor_id=vendor_id).first()
            main_product_type = session.query(Product.product_type). \
                filter_by(product_id=order_items[0]["product_id"]).scalar()

            for item in order_items:
                product_id, quantity = item.get("product_id"), item.get("quantity")

                if not is_instance_already_exists(Product, product_id=product_id):
                    raise ValidationError(f"Product with id {product_id} does not exist", 404)

                product = session.query(Product).filter_by(product_id=product_id).first()
                total_volume += product.volume * quantity
                products_to_order[product_id] = quantity
                product_ids.append(product_id)

                if not vendor.is_government:
                    total_price += product.price * quantity

                if product.product_type != main_product_type:
                    raise ValidationError("All products must be of the same type", 400)

            if order.order_type == "to_warehouse":
                if not self.__is_warehouse_capacity_enough(warehouse_id, total_volume):
                    raise ValidationError("Warehouse capacity is not enough.", 400)
            elif order.order_type == "from_warehouse":
                if not self.__are_warehouse_products_enough(warehouse_id, products_to_order):
                    raise ValidationError("Warehouse does not have enough products.", 400)

            for old_item in old_items:
                old_product_id = old_item.product_id
                if old_product_id not in product_ids:
                    session.delete(old_item)
                else:
                    old_item.quantity = products_to_order[old_product_id]
                    products_to_order.pop(old_item.product_id)

            if len(list(products_to_order.keys())) > 0:
                for product_id, quantity in products_to_order.items():
                    order_item = OrderItem(
                        order_id=order.order_id,
                        product_id=product_id,
                        quantity=quantity
                    )
                    session.add(order_item)

            order.total_price = total_price
            order.updated_at = datetime.now()
            session.commit()

            self.response.status_code = 200
            self.response.data = order.to_dict(cascade_fields=())
            self.response.data["items"] = [
                order_item.to_dict(cascade_fields=()) for order_item in order.ordered_items
            ]
            self.response.data["total_volume"] = total_volume

            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def confirm(self, request: dict) -> dict:
        """
        Confirm an order in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        if self.requester_role != UserRole.MANAGER.value["code"]:
            raise ValidationError("Only manager can confirm an order.", 403)

        transport_id = self.body.get("transport_id")
        order = self.instance

        if not is_instance_already_exists(Transport, transport_id=transport_id):
            raise ValidationError(f"Transport with id {transport_id} does not exist.", 404)

        with get_session() as session:
            transport_capacity = \
                session.query(Transport.transport_capacity).filter_by(transport_id=transport_id).first()[0]
            order_capacity = session.query(func.sum(OrderItem.quantity * Product.volume)). \
                join(Product, OrderItem.product_id == Product.product_id). \
                filter(OrderItem.order_id == order.order_id).scalar()

            if transport_capacity < order_capacity:
                raise ValidationError("Transport capacity is not enough.", 400)

            order.order_status = "submitted"
            order.transport_id = transport_id
            order.updated_at = datetime.now()

            session.commit()

            self.response.status_code = 200
            self.response.data = order.to_dict(cascade_fields=("transport",))
            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def cancel(self, request: dict) -> dict:
        """
        Change status of an order to "cancelled" in the database.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """

        order = self.instance
        requester_role = self.requester_role
        requester_id = self.requester_id

        with get_session() as session:
            requester = session.query(User).filter_by(user_id=requester_id).first()

            if requester_role == UserRole.VENDOR.value["code"]:
                requester_vendors = session.query(Vendor.vendor_id).filter_by(
                    vendor_owner_id=requester_id).all()
                requester_vendors = [vendor[0] for vendor in requester_vendors]
            elif requester_role == UserRole.MANAGER.value["code"]:
                requester_warehouses = session.query(Warehouse.warehouse_id).filter_by(
                    company_id=requester.company.company_id).all()
                requester_warehouses = [warehouse[0] for warehouse in requester_warehouses]

            if requester_role == UserRole.SUPERVISOR.value["code"] or (
                    (
                    requester_role == UserRole.VENDOR.value["code"] and (
                    (order.order_type == "from_warehouse" and order.supplier_id not in requester_vendors) or
                    (order.order_type == "to_warehouse" and order.recipient_id not in requester_vendors)
                       )
                    ) or (
                    (requester_role in (UserRole.MANAGER.value["code"], UserRole.SUPERVISOR.value["code"])) and (
                        (order.order_type == "to_warehouse" and order.recipient_id not in requester_warehouses) or
                        (order.order_type == "from_warehouse" and order.supplier_id not in requester_warehouses)
                       )
                    )
            ):
                raise ValidationError("Order not found.", 404)

        if order.order_status != "new":
            raise ValidationError(f"You can not delete order in status '{order.order_status}'", 403)

        order.order_status = "cancelled"
        order.updated_at = datetime.now()
        session.commit()

        self.response.status_code = 200
        self.response.data = order.to_dict(cascade_fields=())
        return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def send_preview(self, request: dict, **kwargs) -> dict:
        """
        Showing the preview from what racks products will be retrieved.
        :param request: dictionary containing url, method, headers
        :param kwargs: arguments to be checked, here you need to pass fields on which instances will be filtered
        :return: dictionary containing status_code and response body with list of dictionaries
        """
        order_id = extract_id_from_url(request["url"], "order")
        creator_id = decode_token(self.headers.get("token"))
        with get_session() as session:

            warehouse_id = session.query(Warehouse.warehouse_id).filter_by(supervisor_id=creator_id).scalar()
            order = session.query(Order).filter_by(order_id=order_id, supplier_id=warehouse_id).first()
            if not order:
                raise ValidationError("Order Not Found", 404)
            if order.order_status != 'submitted':
                raise ValidationError("You cannot send orders that are not submitted", 404)

            filled_inventories = []

            order_items = session.query(OrderItem).filter_by(order_id=order_id).all()

            for order_item in order_items:
                product = session.query(Product).filter_by(product_id=order_item.product_id).first()
                overall_volume = product.volume * order_item.quantity
                total_quantity = order_item.quantity

                inventories = session.query(Inventory
                                            ).join(Rack, Rack.rack_id == Inventory.rack_id
                                                   ).filter(Inventory.product_id == product.product_id
                                                            ).order_by(Rack.rack_position).all()

                for inventory in inventories:
                    if overall_volume < inventory.total_volume:
                        max_volume = overall_volume
                    else:
                        max_volume = inventory.total_volume

                    real_quantity = floor(max_volume / product.volume)

                    filled_inventories.append({
                        'product_id': order_item.product_id,
                        'rack_id': inventory.rack_id,
                        'real_quantity': real_quantity
                    })

                    total_quantity -= real_quantity
                    overall_volume = total_quantity * product.volume

                    if total_quantity == 0:
                        break

                if total_quantity != 0:
                    raise ValidationError('Could not send order', 404)

            self.response.status_code = 200
            self.response.data["filled_inventories"] = filled_inventories

            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def send(self, request: dict) -> dict:
        """
        Sending the order.
        :param request: dictionary containing url, method, headers
        :return: dictionary containing status_code and response body
        """
        order_id = extract_id_from_url(request["url"], "order")
        creator_id = decode_token(self.headers.get("token"))
        with get_session() as session:

            warehouse_id = session.query(Warehouse.warehouse_id).filter_by(supervisor_id=creator_id).scalar()
            order = session.query(Order).filter_by(order_id=order_id, supplier_id=warehouse_id).first()
            if not order:
                raise ValidationError("Order Not Found", 404)
            if order.order_status != 'submitted':
                raise ValidationError("You cannot send orders that are not submitted", 404)

            filled_inventories = self.body.get("filled_inventories")

            for filled_inventory in filled_inventories:
                product_id = filled_inventory['product_id']
                rack_id = filled_inventory['rack_id']
                quantity = filled_inventory['real_quantity']

                product = session.query(Product).filter_by(product_id=product_id).first()
                inventory = session.query(Inventory).filter_by(product_id=product_id, rack_id=rack_id).first()

                diff = inventory.quantity - quantity
                changed_volume = product.volume * quantity
                if diff == 0:
                    session.delete(inventory)
                else:
                    session.query(Inventory).filter_by(rack_id=rack_id, product_id=product_id
                                                       ).update({"quantity": diff,
                                                                 "total_volume": inventory.total_volume - changed_volume})

                session.flush()

                rack = session.query(Rack).filter_by(rack_id=rack_id).first()
                session.query(Rack).filter_by(rack_id=rack_id).update(
                    {"remaining_capacity": rack.remaining_capacity + changed_volume})

                warehouse = session.query(Warehouse).filter_by(warehouse_id=warehouse_id).first()
                session.query(Warehouse).filter_by(warehouse_id=warehouse.warehouse_id).update(
                    {"remaining_capacity": warehouse.remaining_capacity + changed_volume})

            session.query(Order).filter_by(order_id=order_id).update(
                    {"order_status": "processing", "updated_at": datetime.now()})

            session.commit()

            self.response.status_code = 200
            self.response.data = order.to_dict(cascade_fields=())
            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def receive_preview(self, request: dict) -> dict:
        """
        Showing the preview from what racks products will be retrieved.
        :param request: dictionary containing url, method, headers
        :return: dictionary containing status_code and response body with list of dictionaries
        """
        order = self.instance
        requester_id = self.requester_id
        requester_role = self.requester_role

        if requester_role not in (
                UserRole.SUPERVISOR.value["code"], UserRole.MANAGER.value["code"], UserRole.ADMIN.value["code"]
        ):
            raise ValidationError("Only supervisor or manager can receive an order.", 403)

        if not order:
            raise ValidationError("Order Not Found", 404)

        if order.order_status not in ["delivered", "lost", "damaged"]:
            raise ValidationError("You cannot receive orders that are not delivered", 400)

        if len(order.ordered_items) == 0:
            raise ValidationError("Order must contain at least one item.", 400)

        with get_session() as session:
            requester = session.query(User).filter_by(user_id=requester_id).first()

            if requester_role == UserRole.SUPERVISOR.value["code"]:
                requester_warehouses = session.query(Warehouse.warehouse_id).filter_by(
                    supervisor_id=requester_id).all()
                requester_warehouses = [warehouse[0] for warehouse in requester_warehouses]
            elif requester_role == UserRole.MANAGER.value["code"]:
                requester_warehouses = session.query(Warehouse.warehouse_id).filter_by(
                    company_id=requester.company.company_id).all()
                requester_warehouses = [warehouse[0] for warehouse in requester_warehouses]

            if order.recipient_id not in requester_warehouses:
                raise ValidationError("You are not allowed to see this order.", 403)

            total_volume = session.query(func.sum(OrderItem.quantity * Product.volume)). \
                join(Product, OrderItem.product_id == Product.product_id). \
                filter(OrderItem.order_id == order.order_id).scalar()

            if order.order_status == "to_warehouse" and not self.__is_warehouse_capacity_enough(
                    order.recipient_id, total_volume):
                raise ValidationError("Warehouse capacity is not enough.", 400)

            filled_inventories = []

            order_items = order.ordered_items

            for order_item in order_items:
                product = order_item.product
                total_volume = product.volume * order_item.quantity
                total_quantity = order_item.quantity

                racks = session.query(Rack).filter_by(
                    warehouse_id=order.supplier_id).order_by(desc(Rack.rack_position)).all()

                for rack in racks:
                    if rack.remaining_capacity == 0:
                        continue

                    max_volume = rack.remaining_capacity if total_volume > rack.remaining_capacity else total_volume

                    real_quantity = floor(max_volume / product.volume)

                    filled_inventories.append({
                        'rack_id': rack.rack_id,
                        'product_id': order_item.product_id,
                        'real_quantity': real_quantity
                    })

                    total_quantity -= real_quantity
                    total_volume = total_quantity * product.volume

                    if total_quantity == 0:
                        break

            self.response.status_code = 200
            self.response.data["filled_inventories"] = filled_inventories

            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def change_status(self, request: dict) -> dict:
        """
        Change status of an order in the database.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        with (get_session() as session):
            # get order
            order = session.query(Order).filter_by(order_id=self.instance_id)

            if order.first() is None:
                raise ValidationError("Order Not Found", 404)

            # if requester is admin
            if self.requester_role == UserRole.ADMIN.value["code"]:
                order = order.first()

                # change status and updated_at
                order.updated_at = datetime.now()
                order.order_status = self.body.get("status")
                session.commit()

                self.response.status_code = 200
                self.response.data = order.to_dict(cascade_fields=())
                return self.response.create_response()

            order_type = order.first().order_type

            # check if recipient has access to the order
            if order_type == "from_warehouse" and self.requester_role == UserRole.VENDOR.value["code"]:
                vendor = session.query(Vendor).filter_by(vendor_owner_id=self.requester_id).first()
                if vendor is None:
                    raise ValidationError("Order Not Found", 404)
                order = order.filter(Order.recipient_id == vendor.vendor_id)

            elif order_type == "to_warehouse":
                warehouse = order.first().recipient_warehouse
                if self.requester_role == UserRole.MANAGER.value["code"]:
                    users = warehouse.company.users
                    for user in users:
                        if user.user_role == UserRole.MANAGER.value["name"]:
                            manager = user
                            break
                    if manager is None:
                        raise ValidationError("Order Not Found", 404)
                elif self.requester_role == UserRole.SUPERVISOR.value["code"]:
                    supervisor = warehouse.supervisor
                    if supervisor is None:
                        raise ValidationError("Order Not Found", 404)

            # check if requester has access to change status
            if (self.requester_role == UserRole.VENDOR.value["code"] and
                    self.body.get("status") not in ["finished", "delivered"]):
                raise ValidationError("You cannot change status of this order", 400)

            if self.requester_role == UserRole.MANAGER.value["code"] and self.body.get("status") != "processing":
                raise ValidationError("You cannot change status of this order", 400)

            if self.requester_role == UserRole.SUPERVISOR.value["code"] and self.body.get("status") != "delivered":
                raise ValidationError("You cannot change status of this order", 400)

            order = order.first()

            # change status and updated_at
            order.updated_at = datetime.now()
            order.order_status = self.body.get("status")
            session.commit()

            self.response.status_code = 200
            self.response.data = order.to_dict(cascade_fields=())
            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def finalize_order(self, request: dict) -> dict:
        """
        Complete delivery to warehouse.
        """
        order_id = extract_id_from_url(request["url"], "order")
        creator_id = decode_token(self.headers.get("token"))
        with get_session() as session:

            warehouse_id = session.query(Warehouse.warehouse_id).filter_by(supervisor_id=creator_id).scalar()
            order = session.query(Order).filter_by(order_id=order_id, supplier_id=warehouse_id)
            if not order.first():
                raise ValidationError("Order Not Found.", 404)

            if order.first().order_status in ("lost", "damaged"):
                # change updated_at and order_status
                order = order.first()
                order.updated_at = datetime.now()
                order.order_status = "finished"
                session.commit()

                self.response.status_code = 200
                self.response.data = order.to_dict(cascade_fields=())
                return self.response.create_response()

            if order.first().order_status != "delivered":
                raise ValidationError("You cannot receive orders that are not delivered.", 400)

            # if order_items is empty
            if len(order.first().ordered_items) == 0:
                raise ValidationError("No items left in the order.", 400)

            # main logic
            filled_inventories = self.body.get("filled_inventories")
            for f_inv in filled_inventories:
                rack_id = f_inv.get("rack_id")
                product_id = f_inv.get("product_id")
                quantity = f_inv.get("quantity")

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

            order = order.first()

            # change updated_at and order_status
            order.updated_at = datetime.now()
            order.order_status = "finished"
            session.commit()

            self.response.status_code = 200
            self.response.data = order.to_dict(cascade_fields=())
            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get_order_stats(self, request: dict) -> dict:
        """
        Get order statistics.
        """
        requester_id = self.requester_id
        requester_role = self.requester_role

        with get_session() as session:
            requester = session.query(User).filter_by(user_id=requester_id).first()
            orders = session.query(Order.order_id)

            if self.requester_role in (UserRole.SUPERVISOR.value["code"], UserRole.MANAGER.value["code"]):
                if self.requester_role == UserRole.SUPERVISOR.value["code"]:
                    warehouse_ids = session.query(Warehouse.warehouse_id).filter_by(
                        supervisor_id=self.requester_id).all()
                    warehouse_ids = [warehouse[0] for warehouse in warehouse_ids]
                else:
                    warehouse_ids = session.query(Warehouse.warehouse_id).filter_by(
                        company_id=requester.company.company_id).all()
                    warehouse_ids = [warehouse[0] for warehouse in warehouse_ids]

                orders = orders.filter(
                    or_(
                        and_(Order.order_type == "from_warehouse", Order.supplier_id.in_(warehouse_ids)),
                        and_(Order.order_type == "to_warehouse", Order.recipient_id.in_(warehouse_ids))
                    )
                )

            elif self.requester_role == UserRole.VENDOR.value["code"]:
                vendor_ids = session.query(Vendor.vendor_id).filter_by(vendor_owner_id=requester.user_id).all()
                vendor_ids = [vendor[0] for vendor in vendor_ids]

                orders = orders.filter(
                    or_(
                        and_(Order.order_type == "to_warehouse", Order.supplier_id.in_(vendor_ids)),
                        and_(Order.order_type == "from_warehouse", Order.recipient_id.in_(vendor_ids))
                    )
                )

            result = (
                session.query(Order.order_status, func.count().label('order_count'))
                .filter(Order.order_id.in_(orders))
                .group_by(Order.order_status)
                .all()
            )
            print(result)


        pass