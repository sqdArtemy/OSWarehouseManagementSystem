from db_config import get_session
from models import Product, User
from services import view_function_middleware, check_allowed_methods_middleware
from services.generics import GenericView
from utilities.enums.data_related_enums import UserRole
from utilities.enums.method import Method
from utilities.exceptions import ValidationError
from utilities import decode_token


class ProductView(GenericView):
    model = Product
    model_name = "product"

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get(self, request: dict) -> dict:
        """
        Get response with desired product`s dictionary.
        :param request: dictionary containing url, method and body
        :return: dictionary containing status_code and response body
        """
        # check if the product and user have the same company_id
        with get_session() as session:
            user_id = decode_token(self.headers.get("token"))
            user = session.query(User).filter(User.user_id == user_id).first()
            if user.company_id != self.instance.company_id:
                raise ValidationError("Product Not Found", 404)

            return super().get(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.GET.value])
    def get_list(self, request: dict, **kwargs) -> dict:
        """
        Get all instances of model.
        :param request: dictionary containing url, method and body
        :param kwargs: arguments to be checked, here you need to pass fields on which instances will be filtered
        :return: dictionary containing status_code and response body with list of dictionaries of products
        """
        # check if the user is from the same company as product
        with get_session() as session:
            requester_id = decode_token(self.headers.get("token"))
            requester = session.query(User).filter(User.user_id == requester_id).first()
            company = requester.company

            if self.requester_role in (UserRole.ADMIN.value["code"], UserRole.VENDOR.value["code"]):
                return super().get_list(request=request, **kwargs)
            else:
                query = session.query(Product).filter(Product.company_id == company.company_id)
                return super().get_list(request=request, pre_selected_query=query, **kwargs)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.DELETE.value])
    def delete(self, request: dict) -> dict:
        """
        Delete product from the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            # get user who wants to delete
            deleter_id = decode_token(self.headers.get("token"))
            deleter = session.query(User).filter(User.user_id == deleter_id).first()

            # if product does not exist or deleter is not from the same company as product, raise ValidationError
            if self.instance is None or deleter.company_id != self.instance.company_id:
                raise ValidationError("Product Not Found", 404)

            return super().delete(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.POST.value])
    def create(self, request: dict) -> dict:
        """
        Create a new product in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            # if product_name already exists in the database, raise ValidationError
            product_name = self.body.get("product_name")
            if session.query(Product).filter(Product.product_name == product_name).first() is not None:
                raise ValidationError("Product with this name already exists in the system", 400)

            # get user who wants to create
            creator_id = decode_token(self.headers.get("token"))
            creator = session.query(User).filter(User.user_id == creator_id).first()

            # set creator`s company_id to body
            self.body["company_id"] = creator.company_id

            return super().create(request=request)

    @view_function_middleware
    @check_allowed_methods_middleware([Method.PUT.value])
    def update(self, request: dict) -> dict:
        """
        Update a product in the database.
        :param request: dictionary containing url, method, body and headers
        :return: dictionary containing status_code and response body
        """
        with get_session() as session:
            # if product_name already exists in the database, raise ValidationError
            product_name = self.body.get("product_name")
            prod_with_same_name = session.query(Product).filter(Product.product_name == product_name).first()
            if product_name is not None and prod_with_same_name is not None:
                raise ValidationError("Product with this name already exists in the system", 400)

            updater_id = decode_token(self.headers.get("token"))
            updater = session.query(User).filter(User.user_id == updater_id).first()

            # if product does not exist or updater is not from the same company as product
            if self.instance is None or updater.company_id != self.instance.company_id:
                raise ValidationError("Product Not Found", 404)

            return super().update(request=request)
