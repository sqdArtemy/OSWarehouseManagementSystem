import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import './warehouse-detail.scss';
import { IWarehouseData } from '../warehouses';

export default function WarehouseDetail() {
  const { warehouse_id } = useParams();
  const location = useLocation();
  const { state } = location;
  const warehouseData: IWarehouseData = state.locWarehouseData;
  console.log('warehouseData', warehouseData);
  // Use warehouse_id to fetch or display warehouse details

  // Create an array of 10 rows, each with 10 cells
  const rows = Array.from({ length: 10 }, (_, rowIndex) => (
    <div className="warehouse-detail-grid-row" key={`row-${rowIndex}`}>
      {Array.from({ length: 10 }, (_, cellIndex) => (
        <div
          className="warehouse-detail-grid-cell"
          key={`cell-${rowIndex}-${cellIndex}`}
        />
      ))}
    </div>
  ));

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
        <div className="warehouse-detail-grid">{rows}</div>
      </div>
      <div className={'warehouse-detail-right'}></div>
    </div>
  );
}
