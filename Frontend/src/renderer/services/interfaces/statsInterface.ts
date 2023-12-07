import { IApiResponse } from '../apiRequestHandler';

export interface IStats {
  getProductsStats(): Promise<IApiResponse>;
  getOrderStats(): Promise<IApiResponse>;
  getLostItems(filters: IOrderFilters): Promise<IApiResponse>;
  getOrderDetails(filters: IOrderFilters): Promise<IApiResponse>;
  getWarehouseItems(filters: IOrderFilters): Promise<IApiResponse>;
}

export interface IOrderFilters {
  created_at_gte?: Date | string,
  created_at_lte?: Date | string,
}
