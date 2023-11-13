import React from 'react';
import SearchIcon from '../../../../../../assets/icons/search-bar-icon.png';
import AddIcon from '../../../../../../assets/icons/add-icon.png';
import './warehouses.scss';

export default function Warehouses() {
  return (<div className="warehouses-container">
    <span className="label" id="label">WAREHOUSES</span>
    <div className="head-of-page">
      <div className="search-bar">
        <input type="search" id="search-bar"/>
        <button id="search-bar-button"><img src={SearchIcon}></img></button>
      </div>
      <button id="add-warehouse"><img id="add-icon" src={AddIcon}></img><span>Add Warehouse</span></button>
    </div>
    <div className="warehouse-items-header">
      <span className="header-item">Warehouse Name</span>
      <span className="header-item">Address</span>
      <span className="header-item">Manager</span>
      <span className="header-item">Capacity</span>
    </div>
    <div className="warehouse-items">
      <span className="item">Я</span>
      <span className="item">ЧМО</span>
      <span className="item">ДЕЛАЮ</span>
      <span className="item">В 2 ЧАСА НОЧИ</span>
    </div>
  </div>);
}
