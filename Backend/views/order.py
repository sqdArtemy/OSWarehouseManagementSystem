from datetime import datetime

from sqlalchemy import func, or_, and_

from db_config import get_session
from models import Order, Transport, OrderItem, Product, Vendor, Warehouse, User
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
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, **kwargs) -> dict:
        """
        Get all orders from the database depending on requester`s role.
        :param request: dictionary containing url, method, body and headers
        :param kwargs: arguments to be checked, here you need to pass fields on which instances will be filtered
        :return: dictionary containing status_code and response body with list of dictionaries of order`s data
        """
        if self.requester_role == UserRole.ADMIN.value["code"]:
            return super().get_list(request=request, **kwargs)

        with get_session() as session:
            requester = session.query(User).filter_by(user_id=self.requester_id).first()
            orders = None

            if self.requester_role in (UserRole.SUPERVISOR.value["code"], UserRole.MANAGER.value["code"]):
                warehouse_ids = session.query(Warehouse.warehouse_id).filter_by(supervisor_id=requester.user_id).all()
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
            return super().get_list(request=request, pre_selected_query=orders, **kwargs)

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

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def cancel(self, request: dict) -> dict:
        """
        Change status of an order to cancelled in the database.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """

        order = self.instance
        requester_role = self.requester_role
        requester_id = self.requester_id

        with get_session() as session:
            if requester_role == UserRole.VENDOR.value["code"]:
                requester_vendors = session.query(Vendor.vendor_id).filter_by(vendor_owner_id=requester_id).all()
                requester_vendors = [vendor[0] for vendor in requester_vendors]
            elif requester_role == UserRole.MANAGER.value["code"]:
                requester_warehouses = session.query(Warehouse.warehouse_id).filter_by(supervisor_id=requester_id).all()
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
