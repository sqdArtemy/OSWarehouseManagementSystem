import { ApiResponse } from '../apiRequestHandler';

export interface IRack {
  addRack(body: IAddRack): Promise<ApiResponse>;
  addMultipleRacks(body: IAddMultipleRacks): Promise<ApiResponse>;
  deleteRack(id: number): Promise<ApiResponse>;
  updateRack(body: IAddRack, id: number): Promise<ApiResponse>;
  getRack(id: number): Promise<ApiResponse>;
}


export interface IAddRack {
  warehouse_id: number,
  rack_position: string;
  overall_capacity: number;
  remaining_capacity?: number;
  rack_id?: number;
}

export interface IAddMultipleRacks {
  warehouse_id: number;
  fixed_total_capacity: number;
  rows: number;
  columns: number;
  rack_positions?: string[];
}

