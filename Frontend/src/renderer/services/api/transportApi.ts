import { ITransport } from '../interfaces/transportsInterface';
import { userApi } from '../../index';
import { ISendData } from '../sendDataInterface';
import { IApiResponse, handleApiRequest } from '../apiRequestHandler';
import {
  IAddTransport,
  ITransportFilters,
} from '../interfaces/TransportsInterface';
import { GenericApi } from './genericApi';

export class TransportApi extends GenericApi implements ITransport {
  constructor() {
    super();
  }

  public async addTransport(body: IAddTransport): Promise<IApiResponse> {
    return await this.create(body, 'transports');
  }

  public async getAllTransports(
    filters: ITransportFilters,
  ): Promise<IApiResponse> {
    return await this.getAll('transports', filters);
  }

  public async editTransport(
    id: number,
    body: IAddTransport,
  ): Promise<IApiResponse> {
    return await this.update(id, body, 'transport');
  }

  public async deleteTransport(id: number): Promise<IApiResponse> {
    return await this.delete(id, 'transport');
  }
}
