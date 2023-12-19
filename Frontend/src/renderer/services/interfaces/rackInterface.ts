import { IApiResponse } from '../apiRequestHandler';

export interface IRack {
  addRack(body: IAddRack): Promise<IApiResponse>;
  addMultipleRacks(body: IAddMultipleRacks): Promise<IApiResponse>;
  deleteRack(id: number): Promise<IApiResponse>;
  updateRack(body: IAddRack, id: number): Promise<IApiResponse>;
  getRack(id: number): Promise<IApiResponse>;
  getAll(filters: IRackFilter): Promise<IApiResponse>;
}


export interface IAddRack {
  warehouse_id?: number,
  rack_position: string;
  overall_capacity: number;
  remaining_capacity?: number;
  rack_id?: number;
  is_expired?: boolean | number;
}

export interface IAddMultipleRacks {
  warehouse_id: number;
  fixed_total_capacity: number;
  rows: number;
  columns: number;
  rack_positions?: string[];
}

export interface IRackFilter {
  rack_position?: string;
  warehouse_id?: string;
}
