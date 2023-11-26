import { ITransport } from '../interfaces/transportsInterface';
import { userApi } from '../../index';
import { ISendData } from '../sendDataInterface';
import { ApiResponse, handleApiRequest } from '../apiRequestHandler';
import { IAddTransport, ITransportFilters } from '../interfaces/TransportsInterface';

export class TransportApi implements ITransport {
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

  public async addTransport(body: IAddTransport): Promise<ApiResponse> {
    const url = '/transports';
    const method = 'POST';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }


  public async getAllTransports(filters: ITransportFilters): Promise<ApiResponse> {
    const url = '/transports';
    const method = 'GET';
    const headers = { filters };
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }
}
