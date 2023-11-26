import { ApiResponse } from '../apiRequestHandler';

export interface ICompany {
  getAll(): Promise<ApiResponse>
}
