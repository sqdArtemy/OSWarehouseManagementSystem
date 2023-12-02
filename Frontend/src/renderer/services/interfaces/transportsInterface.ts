import { ApiResponse } from '../apiRequestHandler';

export interface ITransport {
  addTransport(body: IAddTransport): Promise<ApiResponse>;
  editTransport(id: number, body: IAddTransport): Promise<ApiResponse>;
  deleteTransport(id: number): Promise<ApiResponse>;
  getAllTransports(filters: ITransportFilters): Promise<ApiResponse>;
}


export interface IAddTransport {
  transport_capacity: number;
  transport_speed: number;
  transport_type: 'truck' | 'van' | 'car' | 'helicopter';
  price_per_weight: number;
}

export interface ITransportFilters {
  transport_type?: 'truck' | 'van' | 'car' | 'helicopter',
}
