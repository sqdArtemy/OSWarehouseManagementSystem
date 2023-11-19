import { ApiResponse } from '../apiRequestHandler';

export interface IProduct {
  addProduct(body: IAddProduct): Promise<ApiResponse>;
  deleteProduct(id: number): Promise<ApiResponse>;
  updateProduct(body: IAddProduct, id: number): Promise<ApiResponse>;
  getProduct(id: number): Promise<ApiResponse>;
  getAllProduct(filters: IProductFilters): Promise<ApiResponse>;
}


export interface IAddProduct {
  product_name: string,
  description: string,
  weight: number,
  volume: number,
  price: number,
  expiry_duration: number, is_stackable: boolean,
  product_type: 'freezer' | 'refrigerated' |'dry' | 'hazardous'
}

export interface IProductFilters {
  product_name_like?: string,
  volume_gte?: number,
  volume_lte?: number,
  price_gte?: number,
  price_lte?: number,
  weight_gte?: number,
  weight_lte?: number

}
