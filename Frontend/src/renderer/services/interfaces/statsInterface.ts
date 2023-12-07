import { ApiResponse } from '../apiRequestHandler';

export interface IStats {
  getProductsStats(): Promise<ApiResponse>;
  getOrderStats(): Promise<ApiResponse>;
  getLostItems(filters: IOrderFilters): Promise<ApiResponse>;
  getOrderDetails(filters: IOrderFilters): Promise<ApiResponse>;
  getWarehouseItems(filters: IOrderFilters): Promise<ApiResponse>;
}

export interface IOrderFilters {
  created_at_gte?: Date | string,
  created_at_lte?: Date | string,
}
