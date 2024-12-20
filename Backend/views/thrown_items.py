from sqlalchemy import func, or_, and_, desc, Float, cast

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
                    cast(func.sum(ThrownItem.quantity), Float).label('total_quantity'),
                    Product.product_name.label('product_name')
                )
                .join(ThrownItem, ThrownItem.product_id == Product.product_id)
                .join(
                        Warehouse,
                        and_(
                            Warehouse.company_id == requester.company_id,
                            Warehouse.warehouse_id == ThrownItem.warehouse_id
                        )
                    )
                .group_by(Product.product_id)
                .order_by(Product.product_name)
            )

            # Apply the filters to the query
            if filters_to_apply:
                thrown_products = thrown_products.filter(*filters_to_apply).all()

            lost = []

            for thrown_product in thrown_products:
                product_id = thrown_product.product_id
                total_quantity = thrown_product.total_quantity
                product_name = thrown_product.product_name

                # Append values with corresponding names to the lost list
                lost.append({
                    'product_id': product_id,
                    'total_quantity': total_quantity,
                    'product_name': product_name
                })

            self.response.status_code = 200
            self.response.data = lost

            return self.response.create_response()
