import {
  IAddMultipleRacks,
  IAddRack,
  IRack
} from '../interfaces/rackInterface';
import { ApiResponse, handleApiRequest } from '../apiRequestHandler';
import { userApi, warehouseApi } from '../../index';
import { ISendData } from '../sendDataInterface';
import { IVendorFilters } from '../interfaces/vendorInterface';

export class RackApi implements IRack {
  private readonly token: string;
  constructor() {
    this.token = userApi.getToken;
  }

  private async handleApiRequestWithToken(
    data: ISendData,
  ): Promise<ApiResponse> {
    data.headers.token = this.token || userApi.getToken;
    console.log(data);
    return await handleApiRequest({
      url: data.url,
      method: data.method,
      body: data.body,
      headers: data.headers,
    });
  }

  public async addRack(body: IAddRack): Promise<ApiResponse> {
    const url = '/racks';
    const method = 'POST';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async deleteRack(id: number): Promise<ApiResponse> {
    const url = '/rack/' + id;
    const method = 'DELETE';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async getRack(id: number): Promise<ApiResponse> {
    const url = '/rack/' + id;
    const method = 'GET';
    const headers = {};
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async updateRack(
    body: IAddRack,
    id: number,
  ): Promise<ApiResponse> {
    const url = '/rack/' + id;
    const method = 'PUT';
    const headers = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }

  public async addMultipleRacks(body: IAddMultipleRacks): Promise<ApiResponse> {
    const warehouse = await warehouseApi.getWarehouse(body.warehouse_id);
    const url = '/rack/multiple';
    const method = 'POST';
    const headers = {};

    if(!warehouse.success){
      body.rack_positions = [];
      return await this.handleApiRequestWithToken({ url, method, body, headers });
    } else {
      const racks = warehouse.data?.data?.racks;
      if(!racks) {
        body.rack_positions = [];
        return await this.handleApiRequestWithToken({ url, method, body, headers });
      }

      const sortedRacks = racks.sort((a, b) => {
        return a.rack_position.localeCompare(b.rack_position);
      })

      let startingLetter = 'A';
      if(racks.length) {
        const lastRack = sortedRacks[sortedRacks.length - 1]?.rack_position;
        const firstLetter = lastRack[0];
        startingLetter = String.fromCharCode(firstLetter.toUpperCase().charCodeAt(0) + 1);
      }

      const positions = [];
      for (let i =0; i< body.rows; i++){
        for (let j =0; j<body.columns; j++){
          positions.push(
            String.fromCharCode(startingLetter.toUpperCase().charCodeAt(0) + i) + j
          );
        }
      }

      body = { ...body, rack_positions: positions };
      delete body.rows;
      delete body.columns;
      return await this.handleApiRequestWithToken({ url, method, body, headers });
    }
  }

  public async getAll(filters: IVendorFilters): Promise<ApiResponse> {
    const url = '/racks';
    const method = 'GET';
    const headers = { filters };
    const body = {};

    return await this.handleApiRequestWithToken({ url, method, body, headers });
  }
}
