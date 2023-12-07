import { IOrderFilters, IStats } from '../interfaces/statsInterface';
import { IApiResponse } from '../apiRequestHandler';
import { GenericApi } from './genericApi';

export class StatsApi extends GenericApi implements IStats {
  constructor() {
    super();
  }

  public async getLostItems(filters: IOrderFilters): Promise<IApiResponse> {
    const url = '/stats/lost-items';
    return await this.genericRequest({ url, method: 'GET', body: {}, headers: { filters }});
  }

  public async getOrderDetails(filters: IOrderFilters): Promise<IApiResponse> {
    const url = '/orders/details';
    return await this.genericRequest({ url, method: 'GET', body: {}, headers: { filters }});
  }

  public async getOrderStats(): Promise<IApiResponse> {
    const url = '/stats/order';
    return await this.genericRequest({ url, method: 'GET', body: {}, headers: {}});
  }

  public async getProductsStats(): Promise<IApiResponse> {
    const url = '/stats/inventory/';
    return await this.genericRequest({ url, method: 'GET', body: {}, headers: {}});
  }

  public async getWarehouseItems(filters: IOrderFilters): Promise<IApiResponse> {
    const url = '/stats/warehouse';
    return await this.genericRequest({ url, method: 'GET', body: {}, headers: { filters}});
  }

}
