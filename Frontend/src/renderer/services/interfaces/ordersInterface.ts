import { ApiResponse } from '../apiRequestHandler';
import { IItem } from './warehouseInterface';

export interface IOrder {
  addOrder(body: IAddOrder): Promise<ApiResponse>;
  cancelOrder(id: number): Promise<ApiResponse>;
  updateOrder(body: IAddOrder, id: number): Promise<ApiResponse>;
  confirmOrder(transport_id: number, id: number): Promise<ApiResponse>;
  changeStatusOfOrder(id: number, status: 'finished' | 'delivered' | 'processing'): Promise<ApiResponse>;
  getOrder(id: number): Promise<ApiResponse>;
  receiveOrderPreview(id: number): Promise<ApiResponse>;
  receiveOrder(id: number, filledInventory: IFilledInventory[]): Promise<ApiResponse>;
  sendOrderPreview(id: number): Promise<ApiResponse>;
  sendOrder(id: number, filledInventory: IFilledInventory[]): Promise<ApiResponse>;
  getAllOrders(filters: IOrderFilters): Promise<ApiResponse>;
}


export interface IAddOrder {
  order_type: 'to_warehouse' | 'from_warehouse';
  warehouse_id: number;
  vendor_id: number;
  items: IItem[];
}

export interface IOrderFilters {
  order_status?: 'new' | 'processing' | 'submitted' | 'finished' | 'cancelled' | 'delivered' | 'lost' | 'damaged',
  created_at_gte?: Date,
  created_at_lte?: Date,
  order_type?: 'from_warehouse' | 'to_warehouse',
  transport_id?: number
}

export interface IFilledInventory {
  quantity: number,
  product_id: number,
  rack_id: number
}
