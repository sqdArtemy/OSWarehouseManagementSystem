import { IApiResponse } from '../apiRequestHandler';

export interface IProduct {
  addProduct(body: IAddProduct): Promise<IApiResponse>;
  deleteProduct(id: number): Promise<IApiResponse>;
  updateProduct(body: IAddProduct, id: number): Promise<IApiResponse>;
  getProduct(id: number): Promise<IApiResponse>;
  getAllProducts(filters: IProductFilters): Promise<IApiResponse>;
}


export interface IAddProduct {
  product_name: string,
  description: string,
  weight: number,
  volume: number,
  price: number,
  expiry_duration: number, is_stackable: boolean,
  product_type: 'freezer' | 'refrigerated' |'dry' | 'hazardous',
  company_id?: number
}

export interface IProductFilters {
  product_name_like?: string,
  volume_gte?: number,
  volume_lte?: number,
  price_gte?: number,
  price_lte?: number,
  weight_gte?: number,
  weight_lte?: number,
  company_id?: number,
  product_type?: 'freezer' | 'refrigerated' |'dry' | 'hazardous';
}
