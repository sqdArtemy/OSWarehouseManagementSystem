import { IInventory } from '../interfaces/inventoryInterface';
import { IApiResponse } from '../apiRequestHandler';
import { IFilledInventory } from '../interfaces/ordersInterface';
import { GenericApi } from './genericApi';

export class InventoryApi extends GenericApi implements IInventory {
  constructor() {
    super();
  }

  public async addInventory(item: IFilledInventory): Promise<IApiResponse> {
    return await this.create(item, 'inventories');
  }

  public async deleteInventory(item: IFilledInventory): Promise<IApiResponse> {
    const url = '/inventory';
    const method = 'DELETE';
    const headers = {};
    const body = item;

    return await this.genericRequest({ url, method, body, headers });
  }
}
