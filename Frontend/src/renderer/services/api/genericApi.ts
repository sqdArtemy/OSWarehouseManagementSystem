import { userApi } from '../../index';
import { ISendData } from '../sendDataInterface';
import { IApiResponse, handleApiRequest } from '../apiRequestHandler';

export class GenericApi {
  private readonly token: string;
  constructor() {
    this.token = userApi.getToken;
  }

  protected async genericRequest(
    data: ISendData,
  ): Promise<IApiResponse> {
    data.headers.token = this.token || userApi.getToken;
    console.log(data);

    return await handleApiRequest({
      url: data.url,
      method: data.method,
      body: data.body,
      headers: data.headers,
    });
  }

  protected async getOne(id: number, url: string): Promise<IApiResponse> {
    url = `/${url}/${id}`;
    const method = 'GET';
    const body = {};
    const headers = { token: this.token } ;

    return await this.genericRequest({ url, method, body, headers});
  }

  protected async getAll(url: string, filters?: {[key: string]: any}): Promise<IApiResponse> {
    url = `/${url}/`;
    const method = 'GET';
    const body = {};
    const headers = filters ? { token: this.token, filters }: { token: this.token };

    return await this.genericRequest({ url, method, body, headers });
  }

  protected async update(id: number, body: {[key: string]: any}, url: string): Promise<IApiResponse> {
    url = `/${url}/${id}`;
    const method = 'PUT';
    const headers = {};

    return await this.genericRequest({ url, method, body, headers });
  }

  protected async create(body: {[key: string]: any}, url: string): Promise<IApiResponse> {
    url = `/${url}/`;
    const method = 'POST';
    const headers = {};

    return await this.genericRequest({ url, method, body, headers });
  }

  protected async delete(id: number, url: string): Promise<IApiResponse> {
    url = `/${url}/${id}`;
    const method = 'DELETE';
    const body = {};
    const headers = { token: this.token } ;

    return await this.genericRequest({ url, method, body, headers});
  }

}
