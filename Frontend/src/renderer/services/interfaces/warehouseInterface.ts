import { IApiResponse } from '../apiRequestHandler';

export interface IWarehouse {
  addWarehouse(body: IAddWarehouse): Promise<IApiResponse>;
  deleteWarehouse(id: number): Promise<IApiResponse>;
  updateWarehouse(body: IAddWarehouse, id: number): Promise<IApiResponse>;
  getWarehouse(id: number): Promise<IApiResponse>;
  getAllWarehouses(filters: IWarehouseFilters): Promise<IApiResponse>;
  findSuitableWarehousesForOrders(body: IFindWarehousesRequest): Promise<IApiResponse>
}


export interface IAddWarehouse {
  warehouse_name: string,
  warehouse_address: string,
  supervisor_id?: number,
  warehouse_type: 'freezer' | 'refrigerated' |'dry' | 'hazardous',
  overall_capacity: number;
  remaining_capacity?: number;
  company_id?: number;
  warehouse_id?: number;
}

export interface IWarehouseFilters {
  warehouse_name_like?: string,
  warehouse_type?: string,
}

export interface IFindWarehousesRequest {
  company_id?: number;
  order_type: "to_warehouse" | "from_warehouse";
  items: IItem[];
}

export interface IItem {
  quantity: number;
  product_id: number;
}
