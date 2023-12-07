import { orderApi, productApi } from '../../../index';
import { IApiResponse } from '../../../services/apiRequestHandler';

const processItems = async (orderData, itemKey) => {
  let itemsMap = [];
  const orderResponse = await orderApi.getOrder(orderData.orderData.orderId);
  console.log(orderResponse);
  if (orderResponse.success) {
    const items = orderResponse.data.body[itemKey];
    const productResponse = await productApi.getAllProducts({});
    const products = productResponse.data.body;
    itemsMap = mapItemsWithProducts(items, products);
  }
  return [...itemsMap];
};

export const getItems = async (orderData) => {
  return processItems(orderData, 'items');
};

export const getLostItems = async (orderData) => {
  return processItems(orderData, 'lost_items');
};

export const mapItemsWithProducts = (items, products) => {
  return items.map((item, idx) => {
    const matchProduct = products.find((product) => {
      return item.product === product.product_id;
    });
    if (matchProduct) {
      return {
        key: (idx + 1).toString(),
        name: matchProduct.product_name,
        amount: item.quantity,
        id: matchProduct.product_id,
      };
    } else {
      return {
        key: (idx + 1).toString(),
        name: '',
        amount: '',
        id: -1,
      };
    }
  });
};
