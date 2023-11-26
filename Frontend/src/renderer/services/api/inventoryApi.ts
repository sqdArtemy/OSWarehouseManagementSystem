import { IInventory} from '../interfaces/inventoryInterface';
import { ApiResponse, handleApiRequest } from '../apiRequestHandler';
import { userApi } from '../../index';
import { ISendData } from '../sendDataInterface';
import { IFilledInventory } from '../interfaces/ordersInterface';

export class InventoryApi implements IInventory {
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

  public async addInventory(item: IFilledInventory): Promise<ApiResponse> {
    const url = '/inventories';
    const method = 'POST';
    const headers = {};
    const body = item;

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async deleteInventory(item: IFilledInventory): Promise<ApiResponse> {
    const url = '/inventory';
    const method = 'DELETE';
    const headers = {};
    const body = item;

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }
}
