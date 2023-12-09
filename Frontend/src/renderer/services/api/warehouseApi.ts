import { IAddWarehouse, IFindWarehousesRequest, IWarehouse, IWarehouseFilters } from '../interfaces/warehouseInterface';
import { IApiResponse, handleApiRequest } from '../apiRequestHandler';
import { GenericApi } from './genericApi';

export class WarehouseApi extends GenericApi implements IWarehouse {
  public warehouseData: IAddWarehouse;
  constructor() {
    super();
  }

  public async addWarehouse(body: IAddWarehouse): Promise<IApiResponse> {
    return await this.create(body, 'warehouses');
  }

  public async deleteWarehouse(id: number): Promise<IApiResponse> {
    return await this.delete(id, 'warehouse');
  }

  public async getAllWarehouses(filters: IWarehouseFilters): Promise<IApiResponse> {
    return await this.getAll('warehouses',filters);
  }

  public async getWarehouse(id: number): Promise<IApiResponse> {
    const url = '/warehouse/' + id;
    const method = 'GET';

    const response = await this.genericRequest({ url, method, body: {}, headers: {} });
    if(response.success){
      this.warehouseData = response.data.data;
    }
    return response;
  }

  public async updateWarehouse(body: IAddWarehouse, id: number): Promise<IApiResponse> {
    return await this.update(id, body, 'warehouse');
  }

  public async findSuitableWarehousesForOrders(body: IFindWarehousesRequest): Promise<IApiResponse> {
    const url = '/warehouse/suitable-warehouses-for-orders';
    return await this.genericRequest({ url, method: 'GET', body, headers: {} });
  }

}
