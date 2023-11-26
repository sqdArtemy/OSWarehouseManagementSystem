import { ApiResponse } from '../apiRequestHandler';
import { IFilledInventory } from './ordersInterface';

export interface IInventory {
  addInventory(item: IFilledInventory): Promise<ApiResponse>;
  deleteInventory(item: IFilledInventory): Promise<ApiResponse>;
}
