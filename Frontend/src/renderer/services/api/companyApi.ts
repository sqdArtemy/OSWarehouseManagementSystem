import { ICompany } from '../interfaces/companiesInterface';
import { IApiResponse } from '../apiRequestHandler';
import { GenericApi } from './genericApi';

export class CompanyApi extends GenericApi implements ICompany {
  constructor() {
    super();
  }
  public async getAll(): Promise<IApiResponse> {
    return await super.getAll('companies', {});
  }
}
