import { IAddWarehouse, IWarehouse, IWarehouseFilters } from '../interfaces/warehouseInterface';
import { ApiResponse, handleApiRequest } from '../apiRequestHandler';
import { userApi } from '../../index';
import { ISendData } from '../sendDataInterface';

export class WarehouseApi implements IWarehouse {
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

  public async addWarehouse(body: IAddWarehouse): Promise<ApiResponse> {
    const url = '/warehouse/warehouses';
    const method = 'POST';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async deleteWarehouse(id: number): Promise<ApiResponse> {
    const url = '/warehouse/' + id;
    const method = 'DELETE';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async getAllWarehouses(filters: IWarehouseFilters): Promise<ApiResponse> {
    const url = '/warehouse/warehouses';
    const method = 'GET';
    const headers = { filters };
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async getWarehouse(id: number): Promise<ApiResponse> {
    const url = '/warehouse/' + id;
    const method = 'GET';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async updateWarehouse(body: IAddWarehouse, id: number): Promise<ApiResponse> {
    const url = '/warehouse/' + id;
    const method = 'PUT';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

}
