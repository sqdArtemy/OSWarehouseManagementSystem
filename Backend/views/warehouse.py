from sqlite3 import IntegrityError

from sqlalchemy import func, or_, and_, cast, Float, Integer

from db_config import get_session
from models import Warehouse, User, Rack, Product, Inventory, OrderItem, Order
from services import view_function_middleware, check_allowed_methods_middleware, check_allowed_roles_middleware
from services.generics import GenericView
from utilities import ValidationError, DatabaseError, decode_token, extract_id_from_url, is_instance_already_exists
from utilities.enums.data_related_enums import UserRole
from utilities.enums.method import Method


class WarehouseView(GenericView):
    model = Warehouse
    model_name = "warehouse"

    def __init__(self):
        super().__init__()
        self.company_id = None

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create a new warehouse in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """

        creator = decode_token(self.headers.get("token"))
        supervisor_id = self.body.get("supervisor_id")
        overall_capacity = self.body.get("overall_capacity")
        remaining_capacity = self.body.get("remaining_capacity")

        with get_session() as session:

            company_id = session.query(User.company_id).filter_by(user_id=creator).scalar()

            # Check if the supervisor exists
            supervisor = session.query(User).filter_by(user_id=supervisor_id,
                                                       user_role='supervisor',
                                                       company_id=company_id).first()

            if not supervisor:
                raise ValidationError("supervisor not found", 404)

            # Check if the supervisor is already assigned to another warehouse
            existing_warehouse = session.query(Warehouse).filter_by(supervisor_id=supervisor_id).first()

            if existing_warehouse:
                raise ValidationError("The specified supervisor is already assigned to another warehouse", 400)

            if not remaining_capacity:
                remaining_capacity = overall_capacity

            company_id = session.query(User.company_id).filter_by(user_id=supervisor_id).scalar()

            try:
                # Create a new warehouse
                new_warehouse = Warehouse(
                    warehouse_name=self.body["warehouse_name"],
                    warehouse_address=self.body["warehouse_address"],
                    supervisor_id=supervisor_id,
                    company_id=company_id,
                    overall_capacity=overall_capacity,
                    remaining_capacity=remaining_capacity,
                    warehouse_type=self.body["warehouse_type"]
                )

                session.add(new_warehouse)
                session.flush()

                session.commit()

                # Build the response
                response_data = {
                    "status": 201,
                    "data": new_warehouse.to_dict(cascade_fields=()),
                    "headers": self.headers
                }

                return response_data

            except IntegrityError as e:
                session.rollback()
                raise DatabaseError(str(e))

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update a warehouse in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """

        with get_session() as session:
            # id of warehouse to be modified
            warehouse_id = extract_id_from_url(request["url"], "warehouse")

            updator = decode_token(self.headers.get("token"))
            company_id = session.query(User.company_id).filter_by(user_id=updator).scalar()
            supervisor_id = self.body.get("supervisor_id")
            supervisor = session.query(User).filter_by(user_id=supervisor_id,
                                                       user_role='supervisor',
                                                       company_id=company_id).first()
            if not supervisor:
                raise ValidationError("supervisor not found", 404)

            existing_warehouse = session.query(Warehouse).filter(
                Warehouse.supervisor_id == supervisor_id,
                Warehouse.warehouse_id != warehouse_id
            ).first()
            if existing_warehouse:
                raise ValidationError("The specified supervisor is already assigned to another warehouse", 400)

            # Check if the warehouse exists and belongs to the same company
            warehouse = session.query(Warehouse).filter_by(warehouse_id=warehouse_id, company_id=company_id).first()

            if not warehouse:
                raise ValidationError("Warehouse Not Found", 404)

            overall_capacity = self.body.get("overall_capacity")

            # Calculate the change in capacity
            capacity_change = float(warehouse.overall_capacity) - float(overall_capacity)

            # Check if the overall capacity is being reduced
            if overall_capacity < warehouse.overall_capacity:
                racks_sum = session.query(
                    cast(func.sum(Rack.overall_capacity), Float),
                    cast(func.sum(Rack.remaining_capacity), Float)
                ).filter_by(warehouse_id=warehouse_id).first()
                if racks_sum[0] is not None and overall_capacity < racks_sum[0]:
                    raise ValidationError("Overall capacity cannot be less than the overall capacity in racks", 400)
                elif racks_sum[1] is not None and overall_capacity < racks_sum[1]:
                    raise ValidationError("Overall capacity cannot be less than the remaining capacity in racks", 400)
                elif capacity_change > warehouse.remaining_capacity:
                    raise ValidationError("Overall capacity cannot be less than the remaining capacity", 400)

        # Update warehouse information
        self.body["remaining_capacity"] = warehouse.remaining_capacity - capacity_change
        self.body = warehouse.to_dict()

        return super().update(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.DELETE.value])
    def delete(self, request: dict) -> dict:
        """
        Delete a warehouse in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """

        with get_session() as session:
            # id of warehouse to be deleted
            warehouse_id = extract_id_from_url(request["url"], "warehouse")

            deleter = decode_token(self.headers.get("token"))
            company_id = session.query(User.company_id).filter_by(user_id=deleter).scalar()

            warehouse = session.query(Warehouse).filter_by(warehouse_id=warehouse_id, company_id=company_id).first()

            if not warehouse:
                raise ValidationError("Warehouse Not Found", 404)
            if warehouse.remaining_capacity != warehouse.overall_capacity:
                raise ValidationError("The inventory must be empty to delete the warehouse", 400)

            # Check if there are racks associated with the warehouse
            racks = session.query(Rack).filter_by(warehouse_id=warehouse_id).all()

            # Delete racks if they exist
            for rack in racks:
                session.delete(rack)

            # Delete the warehouse
            session.delete(warehouse)

        response_data = {
            "status": 204,
            "data": {},
            "headers": self.headers
        }

        return response_data

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get(self, request: dict) -> dict:
        """
        Get information about a warehouse including details about its racks.
        :param request: dictionary containing url, method, and headers
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            # id of the warehouse to be retrieved
            warehouse_id = extract_id_from_url(request["url"], "warehouse")

            retriever = decode_token(self.headers.get("token"))
            company_id = session.query(User.company_id).filter_by(user_id=retriever).scalar()

            warehouse = session.query(Warehouse).filter_by(warehouse_id=warehouse_id, company_id=company_id).first()

            if not warehouse:
                raise ValidationError("Warehouse Not Found", 404)

            # Get details about the warehouse
            warehouse_info = {
                "warehouse_id": warehouse.warehouse_id,
                "supervisor_id": warehouse.supervisor_id,
                "warehouse_name": warehouse.warehouse_name,
                "warehouse_address": warehouse.warehouse_address,
                "overall_capacity": warehouse.overall_capacity,
                "remaining_capacity": warehouse.remaining_capacity,
                "warehouse_type": warehouse.warehouse_type,
                "racks": []
            }

            # Get details about racks in the warehouse
            racks = session.query(Rack).filter_by(warehouse_id=warehouse_id).all()

            for rack in racks:
                rack_info = {
                    "rack_id": rack.rack_id,
                    "rack_position": rack.rack_position,
                    "overall_capacity": rack.overall_capacity,
                    "remaining_capacity": rack.remaining_capacity,
                    "ratio": (rack.remaining_capacity / rack.overall_capacity) * 100
                }
                warehouse_info["racks"].append(rack_info)

            response_data = {
                "status": 201,
                "data": warehouse_info,
                "headers": self.headers
            }
            return response_data

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, **kwargs) -> dict:
        """
        Get information about warehouses of a company, optionally filtered by warehouse_name.
        :param request: dictionary containing url, method, headers, and filters
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            requester_id = decode_token(self.headers.get("token"))
            requester = session.query(User).filter(User.user_id == requester_id).first()
            company = requester.company

            if self.requester_role == UserRole.ADMIN.value["code"]:
                return super().get_list(request=request, **kwargs)
            else:
                query = session.query(Warehouse).filter(Warehouse.company_id == company.company_id)
                return super().get_list(request=request, pre_selected_query=query, **kwargs)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def suitable_for_order(self, request: dict, **kwargs) -> dict:
        """
        Returns a list of warehouses that are suitable for the order according to the order`s items.
        :param request: dictionary containing url, method, headers, and filters
        :return: response with list of available warehouses
        """
        if self.requester_role != UserRole.VENDOR.value["code"]:
            raise ValidationError("You are not allowed to perform this action", 403)

        company_id = self.body.get("company_id", None)
        order_type = self.body.get("order_type", None)
        products = self.body.get("items", [])
        products_to_order = {}
        main_product_type = None
        product_ids = []
        total_volume = 0

        with get_session() as session:
            if not company_id:
                raise ValidationError("Company id is required", 400)
            if order_type not in ["from_warehouse", "to_warehouse"]:
                raise ValidationError("Invalid order type", 400)
            if len(products) == 0:
                raise ValidationError("Items are required", 400)
            else:
                main_product_type = session.query(Product.product_type).filter_by(
                    product_id=products[0]["product_id"]).scalar()
                for product in products:
                    product_id, quantity = product.get("product_id"), product.get("quantity")

                    if not is_instance_already_exists(Product, product_id=product_id):
                        raise ValidationError(f"Product with id {product_id} does not exist", 404)

                    product = session.query(Product).filter_by(product_id=product_id).first()
                    total_volume += product.volume * quantity
                    products_to_order[product_id] = quantity
                    product_ids.append(product_id)

                    if product.product_type != main_product_type:
                        raise ValidationError("All products must be of the same type", 400)

            # Get all warehouses of the company according to the product type
            warehouses = session.query(Warehouse).filter(
                Warehouse.company_id == company_id, Warehouse.warehouse_type == main_product_type
            )

            # Filter warehouses by order type
            if order_type == "from_warehouse":
                warehouses = warehouses.join(Rack).join(Inventory).filter(Inventory.product_id.in_(product_ids)). \
                    with_entities(
                    Warehouse,
                    Inventory.product_id,
                    cast(func.sum(Inventory.quantity), Float).label('total_quantity')
                ).group_by(Warehouse.warehouse_id, Inventory.product_id).all()

                warehouse_products = {}
                for w in warehouses:
                    warehouse_id = w[0]
                    product_id = w[1]
                    quantity = w[2]

                    if warehouse_id in warehouse_products:
                        warehouse_products[warehouse_id][product_id] = quantity
                    else:
                        warehouse_products[warehouse_id] = {product_id: quantity}

                warehouses = [
                    warehouse for warehouse, products in warehouse_products.items()
                    if all(products_to_order[product_id] <= quantity for product_id, quantity in products.items())
                ]

            elif order_type == "to_warehouse":
                warehouses = warehouses.filter(Warehouse.remaining_capacity >= total_volume).all()

            # Create response
            body = [warehouse.to_dict() for warehouse in warehouses]
            self.response.status_code = 200
            self.response.data = body
            return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    @check_allowed_roles_middleware([UserRole.MANAGER.value["code"]])
    def most_used_warehouses(self, request: dict, **kwargs) -> dict:
        """
        Returns a list of warehouses that are most used.
        """
        with get_session() as session:
            # get company_id of manager
            company_id = session.query(User.company_id).filter_by(user_id=self.requester_id).scalar()

            # actual query
            query = (
                session.query(
                    Warehouse.warehouse_name,
                    cast(func.count(), Integer),
                    cast(func.sum(Product.volume * OrderItem.quantity), Float),
                    cast(func.sum(Order.total_price), Float)
                )
                .join(Order, or_(
                    and_(Order.order_type == 'to_warehouse', Order.recipient_id == Warehouse.warehouse_id),
                    and_(Order.order_type == 'from_warehouse', Order.supplier_id == Warehouse.warehouse_id)
                ))
                .join(OrderItem, OrderItem.order_id == Order.order_id)
                .join(Product, Product.product_id == OrderItem.product_id)
                .filter(Order.order_status == 'finished', Warehouse.company_id == company_id)
                .group_by(Warehouse.warehouse_name)
            )

            # if there are filters apply them
            for column, value in kwargs.items():
                if column == "created_at_gte":
                    query = query.filter(Order.created_at >= value)
                elif column == "created_at_lte":
                    query = query.filter(Order.created_at <= value)

            result = query.all()

            # create response
            orders_count = dict()
            orders_volume = dict()
            orders_price = dict()

            data = dict()

            for row in result:
                orders_count[row[0]] = row[1]
                orders_volume[row[0]] = row[2]
                orders_price[row[0]] = row[3]

            data["orders_count"] = orders_count
            data["orders_volume"] = orders_volume
            data["orders_price"] = orders_price

            self.response.status_code = 200
            self.response.data = data
            return self.response.create_response()