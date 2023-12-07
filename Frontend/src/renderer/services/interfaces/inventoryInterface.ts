import { IApiResponse } from '../apiRequestHandler';
import { IFilledInventory } from './ordersInterface';

export interface IInventory {
  addInventory(item: IFilledInventory): Promise<IApiResponse>;
  deleteInventory(item: IFilledInventory): Promise<IApiResponse>;
}
