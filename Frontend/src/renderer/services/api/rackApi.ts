import {
  IAddRack,
  IRack,
} from '../interfaces/rackInterface';
import { ApiResponse, handleApiRequest } from '../apiRequestHandler';
import { userApi } from '../../index';
import { ISendData } from '../sendDataInterface';

export class RackApi implements IRack {
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

  public async addRack(body: IAddRack): Promise<ApiResponse> {
    const url = '/rack/racks';
    const method = 'POST';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async deleteRack(id: number): Promise<ApiResponse> {
    const url = '/rack/' + id;
    const method = 'DELETE';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async getRack(id: number): Promise<ApiResponse> {
    const url = '/rack/' + id;
    const method = 'GET';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async updateRack(
    body: IAddRack,
    id: number,
  ): Promise<ApiResponse> {
    const url = '/rack/' + id;
    const method = 'PUT';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }
}
