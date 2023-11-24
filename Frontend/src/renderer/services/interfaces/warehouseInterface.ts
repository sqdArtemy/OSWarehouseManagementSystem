import { ApiResponse } from '../apiRequestHandler';

export interface IWarehouse {
  addWarehouse(body: IAddWarehouse): Promise<ApiResponse>;
  deleteWarehouse(id: number): Promise<ApiResponse>;
  updateWarehouse(body: IAddWarehouse, id: number): Promise<ApiResponse>;
  getWarehouse(id: number): Promise<ApiResponse>;
  getAllWarehouses(filters: IWarehouseFilters): Promise<ApiResponse>;
}


export interface IAddWarehouse {
  warehouse_name: string,
  warehouse_address: string,
  manager_id: number,
  warehouse_type: 'freezer' | 'refrigerated' |'dry' | 'hazardous',
  overall_capacity: number;
  remaining_capacity?: number;
}

export interface IWarehouseFilters {
  warehouse_name_like?: string,
  warehouse_type?: string,
}
