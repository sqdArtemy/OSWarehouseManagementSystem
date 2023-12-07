import { IApiResponse } from '../apiRequestHandler';

export interface IVendor {
  addVendor(body: IAddVendor): Promise<IApiResponse>;
  deleteVendor(id: number): Promise<IApiResponse>;
  updateVendor(body: IAddVendor, id: number): Promise<IApiResponse>;
  getVendor(id: number): Promise<IApiResponse>;
  getAllVendors(filters: IVendorFilters): Promise<IApiResponse>;
}


export interface IAddVendor {
  vendor_name?: string,
  vendor_address?: string,
  vendor_owner_id?: number,
  is_government?: number | boolean;
}

export interface IVendorFilters {
  vendor_name_like?: string,
}
