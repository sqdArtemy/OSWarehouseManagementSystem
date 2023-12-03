import React, { useEffect, useState } from 'react';
import './requests.scss';
import { Table } from 'antd';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import { IOrderFilters } from '../../../services/interfaces/ordersInterface';
import debounce from 'lodash.debounce';
import Accept from './accept-component/accept';
import { orderApi } from '../../../index';
import { useLocation } from 'react-router-dom';

export interface IacceptData{
  from: string;
  to: string;
  createdAt: string;
}

export default function Requests() {
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [fromTo, setFromTo] = useState([]);
  const [toFrom, setToFrom] = useState([]);
  const [isAcceptVisible, setIsAcceptVisible] = useState(false);
  const [acceptData, setAcceptData] = useState({});
  const location = useLocation();
  const { state } = location;


  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      from: '',
      to: '',
      createdAt: '',
    }),
  );
  const handleAccept = (e) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);
    setIsAcceptVisible(true);
  };
  const hideAccept = () => {
    setIsAcceptVisible(false);
  };

  const columns = [
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      key: 'vendor',
      align: 'center',
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouse',
      key: 'warehouse',
      align: 'center',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '10%',
      align: 'center',
      render: (_, record) =>
        record.createdAt ? (
          <span className={'table-actions-container'}>
        <button
          className='accept-btn'
          onClick={(e) => handleAccept(e)}
        >
          Accept
        </button>
          </span>
        ) : null,
    },
  ];


  useEffect(() => {

    orderApi.getAllOrders({order_status: 'processing'}).then(async (data) => {
      const orders = data.data?.body;

      if (orders?.length) {
        const finishedItems = [];
        const activeItems = [];
        let activeKey = 0;
        let finishKey = 0;
        for (let i = 0; i < orders.length; i++) {
          let order = orders[i];
          const vendor = order.order_type === 'to_warehouse' ? order.supplier : order.recipient;
          const warehouse = order.order_type === 'from_warehouse' ? order.supplier : order.recipient;

          const orderItem = {
            order_status: orders[i].order_status,
            order_type: orders[i].order_type,
            createdAt: orders[i].created_at,
            order_id: orders[i].order_id,
            vendor: vendor?.vendor_name,
            vendor_id: vendor?.vendor_id,
            warehouse: warehouse?.warehouse_name,
            warehouse_id: warehouse?.warehouse_id
          };


          if (order.order_type === 'from_warehouse') {
            orderItem.key = (activeKey++).toString();
            activeItems.push(orderItem);
          } else {
            orderItem.key = (finishKey++).toString();
            finishedItems.push(orderItem)
          }
        }

        console.log(finishedItems, activeItems);
        setFromTo(finishedItems);
        setToFrom(activeItems);
      } else {
        setFromTo([]);
        setToFrom([]);
      }
    });

    // setFromTo([
    //   {
    //     key: '1',
    //     from: 'something',
    //     to: 'something',
    //     createdAt: '11.09.2001',
    //   },
    // ]);
    // setToFrom([
    //   {
    //     key: '1',
    //     from: 'something',
    //     to: 'something',
    //     createdAt: '12.09.2001',
    //   },
    // ]);
    const calculateScrollSize = () => {
      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0,
      );
      const vh = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0,
      );

      setScrollSize({
        x: vw * 0.3,
        y: vh * 0.3,
      });
    };

    calculateScrollSize();
    window.addEventListener('resize', calculateScrollSize);

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);


  let fromToTableData = fromTo.length > 0 ? fromTo : placeholderData;
  if (fromToTableData.length < placeholderRowCount) {
    fromToTableData = [...fromToTableData, ...placeholderData.slice(fromToTableData.length + 1)];
  }

  let toFromTableData = toFrom.length > 0 ? toFrom : placeholderData;
  if (toFromTableData.length < placeholderRowCount) {
    toFromTableData = [...toFromTableData, ...placeholderData.slice(toFromTableData.length + 1)];
  }



  const nameOfWarehouse = '';

  return (
    <div className="orders-container">
      <div className={'orders-table-container'}>
        <div className={'orders-table-header-container'}>
          <span className={'orders-table-header'}>WAREHOUSE {nameOfWarehouse}</span>
        </div>
        <div className="requests-table">
          <span className="custom-table-header">FROM VENDOR TO WAREHOUSE</span>
          <Table
            rowSelection={}
            dataSource={fromToTableData as []}
            columns={columns as []}
            scroll={scrollSize}
            pagination={false}
            size={'small'}
            bordered={true}
            className={'requests-data-table'}
            rowClassName={'highlight-bottom-border highlight-left-border'}
          />
        </div>
        <div className="requests-table">
          <span className="custom-table-header">FROM WAREHOUSE TO VENDOR</span>
          <Table
            rowSelection={}
            dataSource={toFromTableData as []}
            columns={columns as []}
            scroll={scrollSize}
            pagination={false}
            size={'small'}
            bordered={true}
            className={'requests-data-table'}
            rowClassName={'highlight-bottom-border highlight-left-border'}
          />
        </div>
        <Accept
          hidePopup={hideAccept}
          isPopupVisible={isAcceptVisible}
          acceptData={{
            acceptData: acceptData,
            setAcceptData: setAcceptData,
          }}
        />
      </div>
    </div>
  );
}
