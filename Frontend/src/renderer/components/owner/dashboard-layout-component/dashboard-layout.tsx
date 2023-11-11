import React from 'react';
import './dashboard-layout.scss';
import DashboardProfileIcon from '../../../../../assets/icons/dashboard-profile-icon.png';
import { useNavigate } from 'react-router-dom';

export function DashboardLayout() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="side-bar">
        <div className="side-bar-top">
          <div className="side-bar-top-header">Warehouse Management System</div>
          <div className="side-bar-top-content">
            <span className={'side-bar-top-content-element'}>
              <span className={'side-bar-top-content-element-icon'}></span>
              <span className={'side-bar-top-content-element-text'}></span>
            </span>
            <span className={'side-bar-top-content-element'}>
              <span className={'side-bar-top-content-element-icon'}></span>
              <span className={'side-bar-top-content-element-text'}></span>
            </span>
            <span className={'side-bar-top-content-element'}>
              <span className={'side-bar-top-content-element-icon'}></span>
              <span className={'side-bar-top-content-element-text'}></span>
            </span>
            <span className={'side-bar-top-content-element'}>
              <span className={'side-bar-top-content-element-icon'}></span>
              <span className={'side-bar-top-content-element-text'}></span>
            </span>
          </div>
        </div>
        <div className="side-bar-bottom">
          <div className="side-bar-bottom-profile">
            <span className="side-bar-bottom-profile-icon">
              <img src={DashboardProfileIcon} alt={'Dashboard Profile Icon'} />
            </span>
            <span className="side-bar-bottom-profile-name">Gentlemenbek</span>
          </div>
          <button
            className="side-bar-bottom-logout"
            onClick={() => {
              navigate('/sign-in');
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/*<div className="main-content"></div>*/}
    </div>
  );
}
