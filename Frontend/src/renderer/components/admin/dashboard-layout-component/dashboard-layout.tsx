import React, { useState } from 'react';
import './dashboard-layout.scss';
import DashboardProfileIcon from '../../../../../assets/icons/dashboard-profile-icon.png';
import DashboardIcon from '../../../../../assets/icons/dashboard-icon.png';
import UsersIcon from '../../../../../assets/icons/dashboard-users-icon.png';
import WarehousesIcon from '../../../../../assets/icons/dashboard-warehouses-icon.png';
import ItemsIcon from '../../../../../assets/icons/dashboard-items-icon.png';
import TransportIcon from '../../../../../assets/icons/dashboard-transport-icon.png'
import OrdersIcon from '../../../../../assets/icons/dashboard-orders-icon.png'
import RacksIcon from '../../../../../assets/icons/dashboard-racks-icon.png'
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

export function AdminDashboardLayout() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const sideBarElements = [
    { iconSrc: DashboardIcon, text: 'Companies' },
    { iconSrc: WarehousesIcon, text: 'Warehouses' },
    { iconSrc: UsersIcon, text: 'Users' },
    { iconSrc: ItemsIcon, text: 'Vendors' },
    { iconSrc: TransportIcon, text: 'Transport'},
    { iconSrc: OrdersIcon, text: 'Orders'},
    { iconSrc: RacksIcon, text: 'Racks'},
    { iconSrc: TransportIcon, text: 'Transport'},
    { iconSrc: TransportIcon, text: 'Transport'},
  ];

  const handleSideBarElementClick = (
    event: React.MouseEvent<HTMLSpanElement>,
    index: number,
  ) => {
    const textElement: HTMLSpanElement = event.currentTarget
      .childNodes[1] as HTMLSpanElement;
    setSelected(index);
    navigate(`/admin/${textElement.innerText.toLowerCase()}`);
  };

  return (
    <div className="dashboard-layout-container">
      <div className="side-bar">
        <div className="side-bar-top">
          <div className={'side-bar-top-header-container'}>
            <div className="side-bar-top-header">
              Warehouse Management System
            </div>
          </div>

          <div className="side-bar-top-content">
            <div className="side-bar-top-content-elements-container">
              {sideBarElements.map((element, index) => (
                <span
                  key={index}
                  className={`side-bar-top-content-element ${
                    selected === index ? 'selected' : ''
                  }`}
                  onClick={(event) => handleSideBarElementClick(event, index)}
                >
                  <span>
                    <img
                      className="side-bar-top-content-element-icon"
                      src={element.iconSrc}
                      alt={`${element.text} Icon`}
                    />
                  </span>
                  <span className="side-bar-top-content-element-text">
                    {element.text}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="side-bar-bottom">
          <div
            className="side-bar-bottom-profile"
            onClick={() => {
              setSelected(null);
              navigate('/admin/profile');
            }}
          >
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

      <Outlet />
    </div>
  );
}