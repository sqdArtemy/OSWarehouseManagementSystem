import { IApiResponse } from '../apiRequestHandler';

export interface ITransport {
  addTransport(body: IAddTransport): Promise<IApiResponse>;
  editTransport(id: number, body: IAddTransport): Promise<IApiResponse>;
  deleteTransport(id: number): Promise<IApiResponse>;
  getAllTransports(filters: ITransportFilters): Promise<IApiResponse>;
}


export interface IAddTransport {
  transport_capacity: number;
  transport_speed: number;
  transport_type: 'truck' | 'van' | 'car' | 'helicopter';
  price_per_weight: number;
}

export interface ITransportFilters {
  transport_type?: 'truck' | 'van' | 'car' | 'helicopter',
  transport_capacity_gte?: number1
}
