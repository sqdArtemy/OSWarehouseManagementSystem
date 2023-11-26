import { ICompany } from '../interfaces/companiesInterface';
import { ISendData } from '../sendDataInterface';
import { userApi } from '../../index';
import { ApiResponse, handleApiRequest } from '../apiRequestHandler';


export class CompanyApi implements ICompany {
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

  public async getAll(): Promise<ApiResponse> {
    const url = '/companies';
    const method = 'GET';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

}
