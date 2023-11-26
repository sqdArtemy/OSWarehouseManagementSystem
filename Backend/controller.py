from views import UserView, CompanyView, InventoryView, OrderView, OrderItemView, ProductView, RackView, VendorView, \
    TransactionView, TransactionItemView, WarehouseView, TransportView
from utilities.exceptions import ValidationError, DatabaseError
from utilities.templates import ResponseFactory
from utilities.enums.method import Method


def controller(request: dict) -> dict:
    """
    Controller for handling requests and processing response.
    :param request:
    :return:
    """

    # Views
    user_view = UserView()
    company_view = CompanyView()
    inventory_view = InventoryView()
    order_view = OrderView()
    order_item_view = OrderItemView()
    product_view = ProductView()
    rack_view = RackView()
    vendor_view = VendorView()
    transaction_view = TransactionView()
    transaction_item_view = TransactionItemView()
    warehouse_view = WarehouseView()
    transport_view = TransportView()

    url = request.get("url", "")
    method = request.get("method", "")
    headers = request.get("headers", {})
    filters = headers.get("filters", {})
    response = ResponseFactory(status_code=400, data={}, message="", headers=headers)
    ip = headers.get("ip", "")
    port = headers.get("port", "")
    socket_fd = headers.get("socket_fd", "")

    # TODO: We need to refactor this code to avoid repetitions and make it more readable

    try:
        # User`s endpoints
        if "/connect" in url:
            print(f"\033[92m|CONNECTED -> IP: {ip}; PORT: {port}; SOCKET_FD: {socket_fd}|\033[0m")
        elif "/disconnect" in url:
            print(f"\033[91m|DISCONNECTED <- IP: {ip}; PORT: {port}; SOCKET_FD: {socket_fd}|\033[0m")
        elif "/user" in url:
            if method == Method.GET.value:
                if "/users" in url:
                    return user_view.get_list(request=request, **filters)
                return user_view.get(request=request)
            elif method == Method.POST.value:
                if "/register" in url:
                    return user_view.sign_up(request=request)
                if "/login" in url:
                    return user_view.login(request=request)
                if "/users" in url:
                    return user_view.create(request=request)
            elif method == Method.DELETE.value:
                return user_view.delete(request=request)
            elif method == Method.PUT.value:
                if "/change_password" in url:
                    return user_view.change_password(request=request)
                return user_view.update(request=request)

        # Company`s endpoints
        elif "/company" in url:
            if method == Method.GET.value:
                return company_view.get(request=request)
            elif method == Method.DELETE.value:
                return company_view.delete(request=request)
            elif method == Method.PUT.value:
                return company_view.update(request=request)
        elif "/companies" in url:
            if method == Method.GET.value:
                return company_view.get_list(request=request, **filters)
            elif method == Method.POST.value:
                return company_view.create(request=request)

        # Inventory`s endpoints
        elif "/inventories" in url:
            if method == Method.GET.value:
                return inventory_view.get_list(request=request, **filters)
            elif method == Method.POST.value:
                return inventory_view.create(request=request)
        elif "/inventory" in url:
            if method == Method.GET.value:
                return inventory_view.get(request=request)
            elif method == Method.DELETE.value:
                return inventory_view.delete(request=request)
            elif method == Method.PUT.value:
                return inventory_view.update(request=request)

        # Order`s endpoints
        elif "/orders" in url:
            if method == Method.GET.value:
                return order_view.get_list(request=request, **filters)
            elif method == Method.POST.value:
                return order_view.create(request=request)
        elif "/order" in url:
            if method == Method.GET.value:
                if "/send" in url:
                    if "/preview" in url:
                        return order_view.send_preview(request=request)
                return order_view.get(request=request)

            elif method == Method.DELETE.value:
                return order_view.delete(request=request)
            elif method == Method.PUT.value:
                if "/confirm" in url:
                    return order_view.confirm(request=request)
                if "/cancel" in url:
                    return order_view.cancel(request=request)
                if "/send":
                    return order_view.send(request=request)
                return order_view.update(request=request)

        # OrderItem`s endpoints
        elif "/order_item" in url:
            if method == Method.GET.value:
                return order_item_view.get(request=request)
            elif method == Method.DELETE.value:
                return order_item_view.delete(request=request)
            elif method == Method.PUT.value:
                return order_item_view.update(request=request)
        elif "/order_items" in url:
            if method == Method.GET.value:
                return order_item_view.get_list(request=request, **filters)
            elif method == Method.POST.value:
                return order_item_view.create(request=request)

        # Product`s endpoints
        elif "/products" in url:
            if method == Method.GET.value:
                return product_view.get_list(request=request, **filters)
            elif method == Method.POST.value:
                return product_view.create(request=request)
        elif "/product" in url:
            if method == Method.GET.value:
                return product_view.get(request=request)
            elif method == Method.DELETE.value:
                return product_view.delete(request=request)
            elif method == Method.PUT.value:
                return product_view.update(request=request)

        # Rack`s endpoints
        elif "/racks" in url:
            if method == Method.GET.value:
                return rack_view.get_list(request=request, **filters)
            elif method == Method.POST.value:
                return rack_view.create(request=request)
        elif "/rack" in url:
            if method == Method.GET.value:
                return rack_view.get(request=request)
            elif method == Method.DELETE.value:
                return rack_view.delete(request=request)
            elif method == Method.PUT.value:
                return rack_view.update(request=request)
            elif method == Method.POST.value:
                if "/multiple" in url:
                    return rack_view.multiple(request=request)

        # Vendor`s endpoints
        elif "/vendors" in url:
            if method == Method.GET.value:
                return vendor_view.get_list(request=request, **filters)
            elif method == Method.POST.value:
                return vendor_view.create(request=request)
        elif "/vendor" in url:
            if method == Method.GET.value:
                return vendor_view.get(request=request)
            elif method == Method.DELETE.value:
                return vendor_view.delete(request=request)
            elif method == Method.PUT.value:
                return vendor_view.update(request=request)

        # Transaction`s endpoints
        elif "/transaction" in url:
            if method == Method.GET.value:
                return transaction_view.get(request=request)
            elif method == Method.DELETE.value:
                return transaction_view.delete(request=request)
            elif method == Method.PUT.value:
                return transaction_view.update(request=request)
        elif "/transactions" in url:
            if method == Method.GET.value:
                return transaction_view.get_list(request=request, **filters)
            elif method == Method.POST.value:
                return transaction_view.create(request=request)

        # TransactionItem`s endpoints
        elif "/transaction_item" in url:
            if method == Method.GET.value:
                return transaction_item_view.get(request=request)
            elif method == Method.DELETE.value:
                return transaction_item_view.delete(request=request)
            elif method == Method.PUT.value:
                return transaction_item_view.update(request=request)
        elif "/transaction_items" in url:
            if method == Method.GET.value:
                return transaction_item_view.get_list(request=request, **filters)
            elif method == Method.POST.value:
                return transaction_item_view.create(request=request)

        # Warehouse`s endpoints
        elif "/warehouses" in url:
            if method == Method.GET.value:
                return warehouse_view.get_list(request=request, **filters)
            elif method == Method.POST.value:
                return warehouse_view.create(request=request)
        elif "/warehouse" in url:
            if method == Method.GET.value:
                if "/suitable-warehouses-for-orders" in url:
                    return warehouse_view.suitable_for_order(request=request)
                return warehouse_view.get(request=request)
            elif method == Method.DELETE.value:
                return warehouse_view.delete(request=request)
            elif method == Method.PUT.value:
                return warehouse_view.update(request=request)

        # Transport`s endpoints
        elif "/transports" in url:
            if method == Method.GET.value:
                return transport_view.get_list(request=request, **filters)
            elif method == Method.POST.value:
                return transport_view.create(request=request)
        elif "/transport" in url:
            if method == Method.GET.value:
                return transport_view.get(request=request)
            elif method == Method.DELETE.value:
                return transport_view.delete(request=request)
            elif method == Method.PUT.value:
                return transport_view.update(request=request)

        # In case of no route found
        else:
            response.status_code = 404
            response.message = "Route not found."
            return response.create_response()

    except (ValidationError, DatabaseError) as e:
        response.status_code = e.status_code
        response.message = e.message
        return response.create_response()

    except Exception as e:
        response.status_code = 500
        response.message = str(e)
        return response.create_response()
