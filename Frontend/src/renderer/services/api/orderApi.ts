import {
  IAddOrder,
  IFilledInventory,
  IOrder,
  IOrderFilters,
} from '../interfaces/ordersInterface';
import { IApiResponse, handleApiRequest } from '../apiRequestHandler';
import { GenericApi } from './genericApi';

export class OrderApi extends GenericApi implements IOrder {
  constructor() {
    super();
  }

  public async addOrder(body: IAddOrder): Promise<IApiResponse> {
    return await this.create(body, 'orders');
  }

  public async cancelOrder(id: number): Promise<IApiResponse> {
    const url = '/order/' + id + '/cancel';
    const method = 'PUT';
    return await this.genericRequest({ url, method, body: {}, headers: {} });
  }

  public async changeStatusOfOrder(
    id: number,
    status: 'finished' | 'delivered' | 'processing',
  ): Promise<IApiResponse> {
    const url = `/order/${id}/status`;
    const method = 'PUT';
    const body = { status };
    const headers = {};
    return await this.genericRequest({ url, method, body, headers });
  }

  public async confirmOrder(
    transport_id: number,
    id: number,
  ): Promise<IApiResponse> {
    const url = `/order/${id}/confirm`;
    const method = 'PUT';
    const headers = {};
    const body = { transport_id };

    return await this.genericRequest({ url, method, body, headers });
  }

  public async getAllOrders(filters: IOrderFilters): Promise<IApiResponse> {
    return await this.getAll('/orders', filters);
  }

  public async getOrder(id: number): Promise<IApiResponse> {
    return await this.getOne(id, 'order');
  }

  public async receiveOrder(
    id: number,
    filledInventory: IFilledInventory[],
  ): Promise<IApiResponse> {
    const url = `/order/${id}/receive`;
    const method = 'PUT';
    const headers = {};
    const processedFilledInventory = filledInventory
      .map((item) => {
        return {
          quantity: item.real_quantity,
          product_id: item.product_id,
          rack_id: item.rack_id,
        };
      })
      .filter((item) => {
        return item.quantity > 0;
      });

    const body = { filled_inventories: processedFilledInventory };
    return await this.genericRequest({ url, method, body, headers });
  }

  public async receiveOrderPreview(id: number): Promise<IApiResponse> {
    const url = `/order/${id}/receive/preview`;

    return await this.genericRequest({
      url,
      method: 'GET',
      body: {},
      headers: {},
    });
  }

  public async sendOrder(
    id: number,
    filledInventory: IFilledInventory[],
  ): Promise<IApiResponse> {
    const url = `/order/${id}/send`;
    const method = 'PUT';
    const headers = {};
    const processedFilledInventory = filledInventory.filter((item) => {
      return item.real_quantity > 0;
    });
    const body = { filled_inventories: processedFilledInventory };

    return await this.genericRequest({ url, method, body, headers });
  }

  public async sendOrderPreview(id: number): Promise<IApiResponse> {
    const url = `/order/${id}/send/preview`;
    return await this.genericRequest({
      url,
      method: 'GET',
      body: {},
      headers: {},
    });
  }

  public async updateOrder(body: IAddOrder, id: number): Promise<IApiResponse> {
    return await this.update(id, body, 'order');
  }

  public async lostItems(
    id: number,
    status: 'lost' | 'damaged',
    filledInventory: IFilledInventory[],
  ): Promise<IApiResponse> {
    const url = '/order/' + id + '/lost-items';
    const method = 'POST';
    const headers = {};

    return await this.genericRequest({
      url,
      method,
      body: { status, items: filledInventory },
      headers,
    });
  }
}
