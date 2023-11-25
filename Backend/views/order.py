from datetime import datetime

from sqlalchemy import func

from db_config import get_session
from models import Order, Transport, OrderItem, Product
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities import ValidationError, is_instance_already_exists
from utilities.enums.data_related_enums import UserRole
from utilities.enums.method import Method


class OrderView(GenericView):
    model = Order
    model_name = "order"

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
            transport_capacity = session.query(Transport.transport_capacity).filter_by(transport_id=transport_id).first()[0]
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
