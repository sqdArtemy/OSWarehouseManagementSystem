import React, { useEffect, useState } from 'react';
import './supervisor-layout.scss';
import ProfileIcon from '../../../../../assets/icons/dashboard-profile-icon.png';
import RequestIcon from '../../../../../assets/icons/dashboard-icon.png';
import WarehouseIcon from '../../../../../assets/icons/dashboard-warehouses-icon.png';
import TransactionsIcon from '../../../../../assets/icons/dashboard-items-icon.png';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { userApi } from '../../../index';
import { useLocation } from 'react-router-dom';

export function SupervisorLayout() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('Gentlemanbek');
  const location = useLocation();

  const sideBarElements = [
    { iconSrc: RequestIcon, text: 'Requests' },
    { iconSrc: WarehouseIcon, text: 'Warehouses' },
  ];

  const handleSideBarElementClick = (
    event: React.MouseEvent<HTMLSpanElement>,
    index: number,
  ) => {
    const textElement: HTMLSpanElement = event.currentTarget
      .childNodes[1] as HTMLSpanElement;
    setSelected(index);
    if (textElement.innerText.toLowerCase() === 'warehouses') {
      if (
        userApi.getUserData &&
        userApi.getUserData.warehouses[0] &&
        userApi.getUserData.warehouses[0]?.warehouse_id
      ) {
        const id = userApi.getUserData.warehouses[0].warehouse_id;
        return navigate('/supervisor/warehouses/' + id, {
          state: {
            locWarehouseData: {
              warehouse_id: id,
              warehouseName: userApi.getUserData.warehouses[0].warehouse_name,
              capacity: userApi.getUserData.warehouses[0].overall_capacity,
              supervisor:
                userApi.getUserData.warehouses[0].supervisor.user_name,
              type: userApi.getUserData.warehouses[0].warehouse_type,
              address: userApi.getUserData.warehouses[0].warehouse_address,
              remaining: userApi.getUserData.warehouses[0].remaining_capacity,
            },
          },
        });
      }
    }
    navigate(`/supervisor/${textElement.innerText.toLowerCase()}`);
  };

  useEffect(() => {
    if (userApi.getUserData) {
      setName(
        userApi.getUserData.user_name + ' ' + userApi.getUserData.user_surname,
      );
    }
  }, []);

  useEffect(() => {
    const path = location.pathname.split('/');
    const text = path[path.length - 1];
    console.log(text);
    if (text === 'requests') {
      setSelected(0);
    } else setSelected(1);
  }, [location.pathname]);

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
