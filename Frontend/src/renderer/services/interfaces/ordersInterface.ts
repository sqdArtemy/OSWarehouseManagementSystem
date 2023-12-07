import { IApiResponse } from '../apiRequestHandler';
import { IItem } from './warehouseInterface';

export interface IOrder {
  addOrder(body: IAddOrder): Promise<IApiResponse>;
  cancelOrder(id: number): Promise<IApiResponse>;
  updateOrder(body: IAddOrder, id: number): Promise<IApiResponse>;
  confirmOrder(transport_id: number, id: number): Promise<IApiResponse>;
  changeStatusOfOrder(
    id: number,
    status: 'finished' | 'delivered' | 'processing',
  ): Promise<IApiResponse>;
  getOrder(id: number): Promise<IApiResponse>;
  receiveOrderPreview(id: number): Promise<IApiResponse>;
  receiveOrder(
    id: number,
    filledInventory: IFilledInventory[],
  ): Promise<IApiResponse>;
  sendOrderPreview(id: number): Promise<IApiResponse>;
  sendOrder(
    id: number,
    filledInventory: IFilledInventory[],
  ): Promise<IApiResponse>;
  getAllOrders(filters: IOrderFilters): Promise<IApiResponse>;
  lostItems(
    id: number,
    status: 'lost' | 'damaged',
    filledInventory: IFilledInventory[],
  ): Promise<IApiResponse>;
}

export interface IAddOrder {
  order_type?: 'to_warehouse' | 'from_warehouse';
  warehouse_id?: number;
  vendor_id?: number;
  items: IItem[];
}

export interface IOrderFilters {
  order_status?:
    | 'new'
    | 'processing'
    | 'submitted'
    | 'finished'
    | 'cancelled'
    | 'delivered'
    | 'lost'
    | 'damaged';
  created_at_gte?: Date;
  created_at_lte?: Date;
  order_type?: 'from_warehouse' | 'to_warehouse';
  transport_id?: number;
}

export interface IFilledInventory {
  quantity?: number;
  real_quantity?: number;
  product_id: number;
  rack_id?: number;
}
