import React from 'react';
import './warehouses-add.scss';

export default function WarehousesAdd() {
  return (
    <div className="warehouses-container">
      <span id="label">ADD WAREHOUSE</span>
      <div className="add-warehouse-form">
        <div className="titles">
          <span className="">Warehouse Name:</span>
          <span className="">Warehouse Address:</span>
          <span className="">Manager:</span>
          <span className="">Overall Warehouse Capacity:</span>
        </div>
        <div className="inputs">
          <input />
          <input />
          <select name="managers" id="managers">
            <option value="rigatoni">Rigatoni</option>
            <option value="dave">Dave</option>
            <option value="pumpernickel">Pumpernickel</option>
            <option value="reeses">Reeses</option>
          </select>


          <input />
          <div className="buttons">
            <button id="clear">CLEAR</button>
            <button id="submit">SUBMIT</button>
          </div>
        </div>
      </div>
    </div>
  );
}
