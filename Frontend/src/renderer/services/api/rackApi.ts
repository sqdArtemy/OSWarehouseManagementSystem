import {
  IAddMultipleRacks,
  IAddRack,
  IRack,
  IRackFilter,
} from '../interfaces/rackInterface';
import { IApiResponse, handleApiRequest } from '../apiRequestHandler';
import { userApi, warehouseApi } from '../../index';
import { ISendData } from '../sendDataInterface';
import { IVendorFilters } from '../interfaces/vendorInterface';
import { GenericApi } from './genericApi';

export class RackApi extends GenericApi implements IRack {
  constructor() {
    super();
  }

  public async addRack(body: IAddRack): Promise<IApiResponse> {
    return await this.create(body, 'racks');
  }

  public async deleteRack(id: number): Promise<IApiResponse> {
    return await this.delete(id, 'rack');
  }

  public async getRack(id: number): Promise<IApiResponse> {
    return await this.getOne(id, 'rack');
  }

  public async updateRack(body: IAddRack, id: number): Promise<IApiResponse> {
    return await this.update(id, body, 'rack');
  }

  public async addMultipleRacks(
    body: IAddMultipleRacks,
  ): Promise<IApiResponse> {
    const warehouse = await warehouseApi.getWarehouse(body.warehouse_id);
    const url = '/rack/multiple';
    const method = 'POST';
    const headers = {};

    if (!warehouse.success) {
      return {
        success: false,
        message: 'Warehouse not found',
      };
    } else {
      const racks = warehouse.data?.data?.racks;
      if (!racks) {
        return {
          success: false,
          message: 'Warehouse has no racks',
        };
      }

      const sortedRacks = racks.sort((a, b) => {
        return a.rack_position.localeCompare(b.rack_position);
      });

      let startingLetter = 'A';
      if (racks.length) {
        const lastRack = sortedRacks[sortedRacks.length - 1]?.rack_position;
        const firstLetter = lastRack[0];
        startingLetter = String.fromCharCode(
          firstLetter.toUpperCase().charCodeAt(0) + 1,
        );
      }

      const positions = [];
      for (let i = 0; i < body.rows; i++) {
        for (let j = 0; j < body.columns; j++) {
          positions.push(
            String.fromCharCode(
              startingLetter.toUpperCase().charCodeAt(0) + i,
            ) + j,
          );

          if (
            startingLetter.toUpperCase().charCodeAt(0) + i >
            'Z'.charCodeAt(0)
          ) {
            return {
              message:
                'Maximum racks reached. Please choose the smaller Number',
              success: false,
            };
          }
        }
      }

      body = { ...body, rack_positions: positions };
      delete body.rows;
      delete body.columns;
      return await this.genericRequest({
        url,
        method,
        body,
        headers,
      });
    }
  }

  public async getAll(filters: IRackFilter): Promise<IApiResponse> {
    return await super.getAll('racks', filters);
  }
}
