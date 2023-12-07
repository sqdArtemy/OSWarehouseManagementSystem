import {
  IAddProduct,
  IProduct,
  IProductFilters,
} from '../interfaces/productsInterface';
import { IApiResponse } from '../apiRequestHandler';
import { GenericApi } from './genericApi';

export class ProductApi extends GenericApi implements IProduct {
  constructor() {
    super();
  }

  public async addProduct(body: IAddProduct): Promise<IApiResponse> {
    return await this.create(body, 'products');
  }

  public async deleteProduct(id: number): Promise<IApiResponse> {
    return await this.delete(id, 'product');
  }

  public async getAllProducts(filters: IProductFilters): Promise<IApiResponse> {
    return await this.getAll('products', filters);
  }

  public async getProduct(id: number): Promise<IApiResponse> {
    return await this.getOne(id, 'product');
  }

  public async updateProduct(
    body: IAddProduct,
    id: number,
  ): Promise<IApiResponse> {
    return await this.update(id, body, 'product');
  }
}
