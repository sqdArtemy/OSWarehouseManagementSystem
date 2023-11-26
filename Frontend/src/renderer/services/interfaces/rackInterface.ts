import { ApiResponse } from '../apiRequestHandler';

export interface IRack {
  addRack(body: IAddRack): Promise<ApiResponse>;
  deleteRack(id: number): Promise<ApiResponse>;
  updateRack(body: IAddRack, id: number): Promise<ApiResponse>;
  getRack(id: number): Promise<ApiResponse>;
}


export interface IAddRack {
  warehouse_id: number,
  rack_position: string;
  overall_capacity: number;
  remaining_capacity?: number;
}

