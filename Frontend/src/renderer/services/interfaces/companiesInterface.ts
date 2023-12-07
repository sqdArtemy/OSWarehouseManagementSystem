import { IApiResponse } from '../apiRequestHandler';

export interface ICompany {
  getAll(): Promise<IApiResponse>
}
