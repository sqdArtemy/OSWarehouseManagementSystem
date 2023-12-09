import {
  IAddVendor,
  IVendor,
  IVendorFilters,
} from '../interfaces/VendorInterface';
import { IApiResponse, handleApiRequest } from '../apiRequestHandler';
import { GenericApi } from './genericApi';

export class VendorApi extends GenericApi implements IVendor {
  constructor() {
    super();
  }

  public async addVendor(body: IAddVendor): Promise<IApiResponse> {
    return await this.create(body, 'vendors');
  }

  public async deleteVendor(id: number): Promise<IApiResponse> {
    return await this.delete(id, 'vendor');
  }

  public async getAllVendors(filters: IVendorFilters): Promise<IApiResponse> {
    return await this.getAll('vendors', filters);
  }

  public async getVendor(id: number): Promise<IApiResponse> {
    return await this.getOne(id, 'vendor');
  }

  public async updateVendor(
    body: IAddVendor,
    id: number,
  ): Promise<IApiResponse> {
    return await this.update(id, body, 'vendor');
  }
}
