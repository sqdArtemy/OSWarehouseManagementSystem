import React from 'react';
import './warehouses-add.scss';

export default function WarehousesAdd() {
  return (
    <div className="warehouses-container">
      <span className="label" id="label">ADD WAREHOUSE</span>
      <div className="add-warehouse-form">
        <span className="">Warehouse Name</span>
        <span className="">Warehouse Address</span>
        <span className="">Manager</span>
        <span className="">Overall Warehouse Capacity</span>
      </div>
    </div>
  );
}
