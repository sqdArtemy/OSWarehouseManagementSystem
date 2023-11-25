import { ApiResponse } from '../apiRequestHandler';

export interface IVendor {
  addVendor(body: IAddVendor): Promise<ApiResponse>;
  deleteVendor(id: number): Promise<ApiResponse>;
  updateVendor(body: IAddVendor, id: number): Promise<ApiResponse>;
  getVendor(id: number): Promise<ApiResponse>;
  getAllVendors(filters: IVendorFilters): Promise<ApiResponse>;
}


export interface IAddVendor {
  vendor_name: string,
  vendor_address: string,
  vendor_owner_id: number,
  is_government: number | boolean;
}

export interface IVendorFilters {
  vendor_name_like?: string,
}
