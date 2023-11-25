from datetime import datetime

from sqlalchemy import func

from db_config import get_session
from models import Order, Transport, OrderItem, Product, Vendor, Warehouse
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities import ValidationError, is_instance_already_exists
from utilities.enums.data_related_enums import UserRole
from utilities.enums.method import Method


class OrderView(GenericView):
    model = Order
    model_name = "order"

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
            if requester_role == UserRole.VENDOR.value["code"]:
                requester_vendors = session.query(Vendor.vendor_id).filter_by(vendor_owner_id=requester_id).all()
                requester_vendors = [vendor[0] for vendor in requester_vendors]
            elif requester_role in (UserRole.MANAGER.value["code"], UserRole.SUPERVISOR.value["code"]):
                requester_warehouses = session.query(Warehouse.warehouse_id).filter_by(supervisor_id=requester_id).all()
                requester_warehouses = [warehouse[0] for warehouse in requester_warehouses]

            if requester_role != UserRole.ADMIN.value["code"] and (
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
                raise ValidationError("You are not allowed to see this order.", 403)

            total_volume = session.query(func.sum(OrderItem.quantity * Product.volume)). \
                join(Product, OrderItem.product_id == Product.product_id). \
                filter(OrderItem.order_id == order.order_id).scalar()

            self.response.status_code = 200
            self.response.data = order.to_dict(cascade_fields=())
            self.response.data["total_volume"] = total_volume
            self.response.data["order_items"] = [
                order_item.to_dict(cascade_fields=()) for order_item in order.ordered_items
            ]

            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create a new order in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        # TODO: Add checkers and validations
        return super().create(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update an order in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        # TODO: Add checkers and validations
        return super().update(request=request)

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
