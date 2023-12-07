import { IOrderFilters, IStats } from '../interfaces/statsInterface';
import { userApi } from '../../index';
import { ApiResponse } from '../apiRequestHandler';

export class StatsApi implements IStats {
  private readonly token: string;
  constructor() {
    this.token = userApi.getToken;
  }

  getLostItems(filters: IOrderFilters): Promise<ApiResponse> {
    return Promise.resolve(undefined);
  }

  getOrderDetails(filters: IOrderFilters): Promise<ApiResponse> {
    return Promise.resolve(undefined);
  }

  getOrderStats(): Promise<ApiResponse> {
    return Promise.resolve(undefined);
  }

  getProductsStats(): Promise<ApiResponse> {
    return Promise.resolve(undefined);
  }

  getWarehouseItems(filters: IOrderFilters): Promise<ApiResponse> {
    return Promise.resolve(undefined);
  }

}
