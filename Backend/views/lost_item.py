from datetime import datetime
from sqlite3 import IntegrityError

from sqlalchemy import func

from db_config import get_session
from models import LostItem, User, Warehouse, Order, Product, OrderItem
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities import extract_id_from_url, ValidationError
from utilities.enums.data_related_enums import UserRole
from utilities.enums.method import Method


class LostItemView(GenericView):
    model = LostItem
    model_name = "lost_item"

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create a new lost_item in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        requester_role = self.requester_role
        requester_id = self.requester_id
        order_id = extract_id_from_url(request["url"], "order")
        requester_warehouses = []
        requester_vendors = []

        with get_session() as session:

            order = session.query(Order).filter_by(order_id=order_id).first()
            if order is None:
                raise ValidationError("Order with given id does not exist.", 404)

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
                raise ValidationError("Order Not Found", 404)

            if (order.order_type == "from_warehouse" and order.order_status != "delivered"
                and requester_role == UserRole.VENDOR.value["code"]) or (
                    order.order_type == "to_warehouse" and order.order_status != "processing"
                    and requester_role == UserRole.SUPERVISOR.value["code"]):
                raise ValidationError("You cannot specify lost/damaged items before the order is delivered", 400)

            items = self.body.get("items")

            for item in items:
                product_id = item.get("product_id")
                quantity = item.get("quantity")

                order_item = session.query(OrderItem).filter_by(order_id=order_id, product_id=product_id).first()
                if order_item is None:
                    raise ValidationError("Product not found", 404)

                if quantity == 0:
                    raise ValidationError("Quantity should not be 0", 400)

                if quantity > order_item.quantity:
                    raise ValidationError("Invalid quantity for the product in this order", 400)

                order_already_lost = session.query(LostItem).filter_by(order_id=order_id, product_id=product_id).first()
                if order_already_lost:
                    order_already_lost.quantity += quantity
                else:
                    lost_item = LostItem(
                        order_id=order_id,
                        product_id=product_id,
                        quantity=quantity
                    )
                    session.add(lost_item)
                try:
                    remaining_quantity = order_item.quantity - quantity

                    if remaining_quantity > 0:
                        order_item.quantity = remaining_quantity
                    else:
                        session.delete(order_item)

                    order.order_status = self.body.get("status")
                    order.updated_at = datetime.now()

                    session.commit()

                except IntegrityError:
                    session.rollback()
                    raise ValidationError("Error creating lost_item", 500)

            order_items = session.query(OrderItem).filter_by(order_id=order_id).first()
            if order_items is None:
                order.order_status = "finished"
                session.commit()

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
