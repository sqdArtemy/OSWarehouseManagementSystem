import {
  IAddOrder,
  IFilledInventory,
  IOrder,
  IOrderFilters,
} from '../interfaces/ordersInterface';
import { ApiResponse, handleApiRequest } from '../apiRequestHandler';
import { userApi } from '../../index';
import { ISendData } from '../sendDataInterface';

export class OrderApi implements IOrder {
  private readonly token: string;

  constructor() {
    this.token = userApi.getToken;
  }

  private async handleApiRequestWithToken(
    data: ISendData,
  ): Promise<ApiResponse> {
    data.headers.token = this.token || userApi.getToken;
    console.log(data);
    return await handleApiRequest({
      url: data.url,
      method: data.method,
      body: data.body,
      headers: data.headers,
    });
  }

  public async addOrder(body: IAddOrder): Promise<ApiResponse> {
    const url = '/orders';
    const method = 'POST';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async cancelOrder(id: number): Promise<ApiResponse> {
    const url = '/order/' + id + '/cancel';
    const method = 'PUT';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async changeStatusOfOrder(
    id: number,
    status: 'finished' | 'delivered' | 'processing',
  ): Promise<ApiResponse> {
    const url = `/order/${id}/status`;
    const method = 'PUT';
    const body = { status };
    const headers = {};
    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async confirmOrder(
    transport_id: number,
    id: number,
  ): Promise<ApiResponse> {
    const url = `/order/${id}/confirm`;
    const method = 'PUT';
    const headers = {};
    const body = { transport_id };

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async getAllOrders(filters: IOrderFilters): Promise<ApiResponse> {
    const url = '/orders';
    const method = 'GET';
    const headers = { filters };
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async getOrder(id: number): Promise<ApiResponse> {
    const url = '/order/' + id;
    const method = 'GET';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async receiveOrder(
    id: number,
    filledInventory: IFilledInventory[],
  ): Promise<ApiResponse> {
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
    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async receiveOrderPreview(id: number): Promise<ApiResponse> {
    const url = `/order/${id}/receive/preview`;
    const method = 'GET';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async sendOrder(
    id: number,
    filledInventory: IFilledInventory[],
  ): Promise<ApiResponse> {
    const url = `/order/${id}/send`;
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

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async sendOrderPreview(id: number): Promise<ApiResponse> {
    const url = `/order/${id}/send/preview`;
    const method = 'GET';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async updateOrder(body: IAddOrder, id: number): Promise<ApiResponse> {
    const url = '/order/' + id;
    const method = 'PUT';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async lostItems(
    id: number,
    status: 'lost' | 'damaged',
    filledInventory: IFilledInventory[],
  ): Promise<ApiResponse> {
    const url = '/order/' + id + '/lost-items';
    const method = 'POST';
    const headers = {};

    return await this.handleApiRequestWithToken({
      url,
      method,
      body: { status, items: filledInventory },
      headers,
    });
  }
}
