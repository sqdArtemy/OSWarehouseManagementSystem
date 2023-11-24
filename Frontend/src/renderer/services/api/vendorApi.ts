import { IAddVendor, IVendor, IVendorFilters } from '../interfaces/VendorInterface';
import { ApiResponse, handleApiRequest } from '../apiRequestHandler';
import { userApi } from '../../index';
import { ISendData } from '../sendDataInterface';

export class VendorApi implements IVendor {
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

  public async addVendor(body: IAddVendor): Promise<ApiResponse> {
    const url = '/vendor/vendors';
    const method = 'POST';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async deleteVendor(id: number): Promise<ApiResponse> {
    const url = '/vendor/' + id;
    const method = 'DELETE';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async getAllVendors(filters: IVendorFilters): Promise<ApiResponse> {
    const url = '/vendor/vendors';
    const method = 'GET';
    const headers = { filters };
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async getVendor(id: number): Promise<ApiResponse> {
    const url = '/vendor/' + id;
    const method = 'GET';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async updateVendor(body: IAddVendor, id: number): Promise<ApiResponse> {
    const url = '/vendor/' + id;
    const method = 'PUT';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

}
