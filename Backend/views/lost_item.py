from datetime import datetime
from sqlite3 import IntegrityError

from sqlalchemy import func
from sqlalchemy import func, or_, and_, desc
from sqlalchemy.orm import joinedload

from db_config import get_session
from models import LostItem, User, Warehouse, Order, Product, OrderItem, Vendor
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

            if requester_role == UserRole.VENDOR.value["code"]:
                requester_vendors = session.query(Vendor.vendor_id).filter_by(
                    vendor_owner_id=requester_id).all()
                requester_vendors = [vendor[0] for vendor in requester_vendors]
            elif self.requester_role == UserRole.SUPERVISOR.value["code"]:
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
                            (requester_role in (
                                    UserRole.MANAGER.value["code"], UserRole.SUPERVISOR.value["code"])) and (
                                    (
                                            order.order_type == "to_warehouse" and order.recipient_id not in requester_warehouses) or
                                    (
                                            order.order_type == "from_warehouse" and order.supplier_id not in requester_warehouses)
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

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, **kwargs) -> dict:
        """
        Display lost_items in the database.
        :param request: dictionary containing url, method, body and headers
        :param kwargs: arguments to be checked, here you need to pass fields on which instances will be filtered
        :return: dictionary containing status_code and response body
        """

        requester_role = self.requester_role
        requester_id = self.requester_id

        if requester_role != UserRole.MANAGER.value["code"]:
            raise ValidationError("Only managers can access this functionality")

        with get_session() as session:
            requester = session.query(User).filter_by(user_id=requester_id).first()

            filters_to_apply = []
            if self.headers.get('filters'):
                cmp = self.headers.get('filters')
                if 'created_at_gte' in cmp:
                    filters_to_apply.append(Order.created_at >= cmp['created_at_gte'])
                if 'created_at_lte' in cmp:
                    filters_to_apply.append(Order.created_at <= cmp['created_at_lte'])

            lost_products = (
                session.query(
                    Product.product_id.label('product_id'),
                    Warehouse.warehouse_id.label('warehouse_id'),
                    func.sum(LostItem.quantity).label('total_quantity'),
                    Warehouse.warehouse_name.label('warehouse_name'),
                    Product.product_name.label('product_name')
                )
                .join(LostItem, LostItem.product_id == Product.product_id)
                .join(Order, Order.order_id == LostItem.order_id)
                .join(Warehouse, or_(
                    and_(Order.order_type == 'to_warehouse', Order.recipient_id == Warehouse.warehouse_id),
                    and_(Order.order_type == 'from_warehouse', Order.supplier_id == Warehouse.warehouse_id)
                ))
                .filter(Warehouse.company_id == requester.company_id)
                .group_by(Warehouse.warehouse_id, Product.product_id)
                .order_by(Warehouse.warehouse_name, Product.product_name)
            )

            # Apply the filters to the query
            if filters_to_apply:
                lost_products = lost_products.filter(*filters_to_apply).all()

            lost = []

            for lost_product in lost_products:
                product_id = lost_product.product_id
                warehouse_id = lost_product.warehouse_id
                total_quantity = lost_product.total_quantity
                warehouse_name = lost_product.warehouse_name
                product_name = lost_product.product_name

                # Append values with corresponding names to the lost list
                lost.append({
                    'product_id': product_id,
                    'warehouse_id': warehouse_id,
                    'total_quantity': total_quantity,
                    'warehouse_name': warehouse_name,
                    'product_name': product_name
                })

            self.response.status_code = 200
            self.response.data = lost

            return self.response.create_response()
