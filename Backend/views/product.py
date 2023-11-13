from models import Product, User
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities.enums.method import Method
from utilities.exceptions import ValidationError
from utilities import  extract_id_from_url, decode_token


class ProductView(GenericView):
    model = Product
    model_name = "product"

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, **kwargs) -> dict:
        """
        Get all instances of product.
        :param request: dictionary containing url, method and body
        :param kwargs: arguments to be checked, here you need to pass fields on which instances will be filtered
        :return: dictionary containing status_code and response body with list of dictionaries of instances` data
        """
        # query = self.session.query(self.model).all()
        #
        # for filter_param, filter_val in kwargs:
        #     if hasattr(self.model, filter_param):
        #         # if product_name, then find all products with product_name like filter_val
        #         if filter_param == "product_name":
        #             query = query.filter(getattr(self.model, filter_param).like(f"%{filter_val}%")).all()
        #
        #         # if filter_param ends with _gte, then find all products with filter_param >= filter_val
        #         elif filter_param.endswith("_gte"):
        #             query = query.filter(getattr(self.model, filter_param[:-4]) >= filter_val).all()
        #
        #         # if filter_param ends with _lte, then find all products with filter_param <= filter_val
        #         elif filter_param.endswith("_lte"):
        #             query = query.filter(getattr(self.model, filter_param[:-4]) <= filter_val).all()
        #
        # instances = query.all()
        # body = [instance.to_dict() for instance in instances]
        # self.response.status_code = 200
        # self.response.data = body
        # return self.response.create_response()
        pass

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get(self, request: dict) -> dict:
        """
        Get response with desired product`s dictionary.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        if self.instance is None:
            raise ValidationError("Product Not Found", 404)

        product = self.session.query(Product).filter(Product.product_id == self.instance_id).first()
        self.response.status_code = 200
        self.response.data = product.to_dict()
        return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.DELETE.value])
    def delete(self, request: dict) -> dict:
        """
        Delete product from the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        id_to_del = extract_id_from_url(request["url"], "product")
        product = self.session.query(Product).filter(Product.product_id == id_to_del).first()
        deleter_id = decode_token(self.headers.get("token"))
        deleter = self.session.query(User).filter(User.user_id == deleter_id).first()

        if product is None or deleter.company_id != product.company_id:
            raise ValidationError("Product Not Found", 404)

        self.session.delete(product)
        self.response.status_code = 204
        self.response.data = {}
        return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create a new product in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        # TODO: Add checkers and validations
        return super().create(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update a product in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        # TODO: Add checkers and validations
        return super().update(request=request)
