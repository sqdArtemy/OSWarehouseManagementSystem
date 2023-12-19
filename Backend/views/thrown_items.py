from datetime import datetime
from sqlite3 import IntegrityError

from sqlalchemy import func
from sqlalchemy import func, or_, and_, desc, Float, cast
from sqlalchemy.orm import joinedload

from db_config import get_session
from models import ThrownItem, User, Warehouse, Order, Product
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities import ValidationError
from utilities.enums.data_related_enums import UserRole
from utilities.enums.method import Method


class ThrownItemView(GenericView):
    model = ThrownItem
    model_name = "thrown_item"
    
    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, **kwargs) -> dict:
        """
        Display thrown_items in the database.
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

            thrown_products = (
                session.query(
                    Product.product_id.label('product_id'),
                    Warehouse.warehouse_id.label('warehouse_id'),
                    cast(func.sum(ThrownItem.quantity), Float).label('total_quantity'),
                    Warehouse.warehouse_name.label('warehouse_name'),
                    Product.product_name.label('product_name')
                )
                .join(ThrownItem, ThrownItem.product_id == Product.product_id)
                .join(Order, Order.order_id == ThrownItem.order_id)
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
                thrown_products = thrown_products.filter(*filters_to_apply).all()

            lost = []

            for thrown_product in thrown_products:
                product_id = thrown_product.product_id
                warehouse_id = thrown_product.warehouse_id
                total_quantity = thrown_product.total_quantity
                warehouse_name = thrown_product.warehouse_name
                product_name = thrown_product.product_name

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
