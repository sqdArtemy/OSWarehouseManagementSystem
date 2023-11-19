import {
  IAddProduct,
  IProduct,
  IProductFilters,
} from '../interfaces/productsInterface';
import { ApiResponse, handleApiRequest } from '../apiRequestHandler';
import { userApi } from '../../index';
import { ISendData } from '../sendDataInterface';

export class ProductApi implements IProduct {
  private readonly token: string;
  constructor() {
    this.token = userApi.getToken;
  }

  private async handleApiRequestWithToken(
    data: ISendData,
  ): Promise<ApiResponse> {
    data.headers.token = this.token || userApi.getToken;
    return await handleApiRequest({
      url: data.url,
      method: data.method,
      body: data.body,
      headers: data.headers,
    });
  }

  public async addProduct(body: IAddProduct): Promise<ApiResponse> {
    const url = '/product/products';
    const method = 'POST';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async deleteProduct(id: number): Promise<ApiResponse> {
    const url = '/product/' + id;
    const method = 'DELETE';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async getAllProducts(filters: IProductFilters): Promise<ApiResponse> {
    const url = '/product/products';
    const method = 'GET';
    const headers = { filters };
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async getProduct(id: number): Promise<ApiResponse> {
    const url = '/product/' + id;
    const method = 'GET';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async updateProduct(
    body: IAddProduct,
    id: number,
  ): Promise<ApiResponse> {
    const url = '/product/' + id;
    const method = 'PUT';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }
}
