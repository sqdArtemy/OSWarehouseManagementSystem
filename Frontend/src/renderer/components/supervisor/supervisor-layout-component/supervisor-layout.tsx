import React, { useEffect, useState } from 'react';
import './supervisor-layout.scss';
import ProfileIcon from '../../../../../assets/icons/dashboard-profile-icon.png';
import RequestIcon from '../../../../../assets/icons/dashboard-icon.png';
import WarehouseIcon from '../../../../../assets/icons/dashboard-warehouses-icon.png';
import TransactionsIcon from '../../../../../assets/icons/dashboard-items-icon.png';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { userApi } from '../../../index';

export function SupervisorLayout() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('Gentlemanbek');

  const sideBarElements = [
    { iconSrc: RequestIcon, text: 'Requests' },
    { iconSrc: WarehouseIcon, text: 'Warehouses' },
    { iconSrc: TransactionsIcon, text: 'Transactions' },
  ];

  const handleSideBarElementClick = (
    event: React.MouseEvent<HTMLSpanElement>,
    index: number,
  ) => {
    const textElement: HTMLSpanElement = event.currentTarget
      .childNodes[1] as HTMLSpanElement;
    setSelected(index);
    navigate(`/supervisor/${textElement.innerText.toLowerCase()}`);
  };

  useEffect(() => {
    if(userApi.getUserData) {
      setName(
        userApi.getUserData.user_name + ' ' + userApi.getUserData.user_surname,
      );
    }
  });

  return (
    <div className="supervisor-layout-container">
      <div className="supervisor-side-bar">
        <div className="supervisor-side-bar-top">
          <div className={'supervisor-side-bar-top-header-container'}>
            <div className="supervisor-side-bar-top-header">
              Warehouse Management System
            </div>
          </div>

          <div className="supervisor-side-bar-top-content">
            <div className="supervisor-side-bar-top-content-elements-container">
              {sideBarElements.map((element, index) => (
                <span
                  key={index}
                  className={`supervisor-side-bar-top-content-element ${
                    selected === index ? 'supervisor-selected' : ''
                  }`}
                  onClick={(event) => handleSideBarElementClick(event, index)}
                >
                  <span>
                    <img
                      className="supervisor-side-bar-top-content-element-icon"
                      src={element.iconSrc}
                      alt={`${element.text} Icon`}
                    />
                  </span>
                  <span className="supervisor-side-bar-top-content-element-text">
                    {element.text}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="supervisor-side-bar-bottom">
          <div
            className="supervisor-side-bar-bottom-profile"
            onClick={() => {
              setSelected(null);
              navigate('/supervisor/profile');
            }}
          >
            <span>
              <img
                className="supervisor-side-bar-bottom-profile-icon"
                src={ProfileIcon}
                alt={'Dashboard Profile Icon'}
              />
            </span>
            <span className="supervisor-side-bar-bottom-profile-name">
              {name}
            </span>
          </div>

          <button
            className="supervisor-side-bar-bottom-logout"
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
