import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import './warehouse-detail.scss';
import { IWarehouseData } from '../warehouses';
import RacksGrid from '../../../racks-grid-component/racks-grid';

export default function WarehouseDetail() {
  const { warehouse_id } = useParams();
  const location = useLocation();
  const { state } = location;
  const warehouseData: IWarehouseData = state.locWarehouseData;
  console.log('warehouseData', warehouseData);

  return (
    <div className={'warehouse-detail-container'}>
      <div className={'warehouse-detail-left'}>
        <span className={'warehouse-detail-header'}>
          <span className={'warehouse-detail-header-type'}>
            {warehouseData.type} Storage
          </span>
          <span className={'warehouse-detail-header-name'}>
            {warehouseData.warehouseName} {warehouse_id}
          </span>
        </span>
        <RacksGrid />
      </div>
      <div className={'warehouse-detail-right'}></div>
    </div>
  );
}
