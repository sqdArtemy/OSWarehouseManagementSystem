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
        # TODO: I get error 'too many values to unpack (expected 2)'

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
        # check if the product and user have the same company_id
        user_id = decode_token(self.headers.get("token"))
        user = self.session.query(User).filter(User.user_id == user_id).first()
        if user.company_id != self.instance.company_id:
            raise ValidationError("Product Not Found", 404)

        return super().get(request=request)

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

        # if product does not exist or deleter is not from the same company as product, raise ValidationError
        if product is None or deleter.company_id != product.company_id:
            raise ValidationError("Product Not Found", 404)

        # delete
        self.session.delete(product)
        self.session.commit()

        # prepare response
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
        # TODO: FIX: this method returns 'weight': Decimal('5.5000') instead if return 'weight': 5.5
        # if product_name already exists in the database, raise ValidationError
        product_name = self.body["product_name"]
        if self.session.query(Product).filter(Product.product_name == product_name).first() is not None:
            raise ValidationError("Product with this name already exists in the system", 400)

        # get user who wants to create
        creator_id = decode_token(self.headers.get("token"))
        creator = self.session.query(User).filter(User.user_id == creator_id).first()

        # create new product
        product = Product(
            product_name=product_name,
            company_id=creator.company_id,
            description=self.body.get("description"),
            weight=self.body.get("weight"),
            volume=self.body.get("volume"),
            price=self.body.get("price"),
            expiry_duration=self.body.get("expiry_duration")
        )

        # save product to the database
        self.session.add(product)
        self.session.commit()

        # prepare response
        self.response.status_code = 201
        self.response.data = product.to_dict()
        return self.response.create_response()

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update a product in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        # TODO: FIX: this method returns 'weight': Decimal('5.5000') instead if return 'weight': 5.5
        # if product_name already exists in the database, raise ValidationError
        product_name = self.body.get("product_name")
        prod_with_same_name = self.session.query(Product).filter(Product.product_name == product_name).first()
        if product_name is not None and prod_with_same_name is not None:
            raise ValidationError("Product with this name already exists in the system", 400)

        id_to_update = extract_id_from_url(request["url"], "product")
        product = self.session.query(Product).filter(Product.product_id == id_to_update).first()
        updater_id = decode_token(self.headers.get("token"))
        updater = self.session.query(User).filter(User.user_id == updater_id).first()

        # product does not exist or updater is not from the same company as product
        if product is None or updater.company_id != product.company_id:
            raise ValidationError("Product Not Found", 404)

        for key, value in self.body.items():
            if hasattr(product, key):
                setattr(product, key, value)
        self.session.commit()

        self.response.status_code = 200
        self.response.data = product.to_dict()
        return self.response.create_response()
