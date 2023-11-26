import React, { useEffect, useState } from 'react';
import './vendor-orders.scss';
import { Table } from 'antd';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import { orderApi } from '../../../index';
import { IOrderFilters } from '../../../services/interfaces/ordersInterface';
import debounce from 'lodash.debounce';

export default function Orders() {
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [currentOrders, setCurrentOrders] = useState([]);
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  let filters: IOrderFilters = {};

  const getAllOrders = async (filters: IOrderFilters) => {
    const result = await orderApi.getAllOrders(filters);
    const orders = result.data?.body;
    const dataItems = [];

    if (orders?.length) {
      for (let i = 0; i < orders.length; i++) {
        const orderItem = {
          key: (i + 1).toString(),
          order_status: orders[i].order_status,
          order_type: orders[i].order_type,
          createdAt: orders[i].createdAt, // Change to your actual createdAt field
          order_id: orders[i].order_id,
          vendor: orders[i].vendor, // Specify vendor data
          warehouse: orders[i].warehouse, // Specify warehouse data
        };

        dataItems.push(orderItem);

        if (orderItem.order_status === 'finished') {
          setFinishedOrders((prevFinishedOrders) => [...prevFinishedOrders, orderItem]);
        } else {
          setCurrentOrders((prevCurrentOrders) => [...prevCurrentOrders, orderItem]);
        }
      }
    } else {
      setCurrentOrders([]);
      setFinishedOrders([]);
    }
  };

  const debouncedSearch = debounce(async (filters) => {
    await getAllOrders(filters);
  }, 1000);

  const handleAddOrder = (e) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);
    setIsPopupVisible(true);
  };

  const hideAddPopup = () => {
    setIsPopupVisible(false);
  };

  const placeholderRowCount = 4;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      order_status: '',
      order_type: '',
      createdAt: '',
      vendor: '', // Specify vendor data
      warehouse: '', // Specify warehouse data
    }),
  );

  let currentTableData = currentOrders.length > 0 ? currentOrders : placeholderData;
  if (currentTableData.length < placeholderRowCount) {
    currentTableData = [...currentTableData, ...placeholderData.slice(currentTableData.length + 1)];
  }

  let finishedTableData = finishedOrders.length > 0 ? finishedOrders : placeholderData;
  if (finishedTableData.length < placeholderRowCount) {
    finishedTableData = [...finishedTableData, ...placeholderData.slice(finishedTableData.length + 1)];
  }

  const columns = [
    {
      title: 'Order Type',
      dataIndex: 'order_type',
      key: 'order_type',
    },
    {
      title: 'Order Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      key: 'vendor',
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
  ];

  useEffect(() => {
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
        x: vw * 0.35,
        y: vh * 0.6,
      });
    };

    calculateScrollSize();
    window.addEventListener('resize', calculateScrollSize);

    getAllOrders(filters);

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  return (
    <div className="orders-container">
      <div className={'orders-table-container'}>
        <div className={'orders-table-header-container'}>
          <span className={'orders-table-header'}>ORDERS</span>
          <div className={'options-container'}>
            <button className={'add-btn'} onClick={(e) => handleAddOrder(e)}>
              <img src={PlusIcon} alt={'Add Button'}></img>
              <span className={'add-btn-text'}>Add Order</span>
            </button>
            {/* AddOrder component and related logic */}
          </div>
        </div>
        <div className="orders-table">
          <span className="custom-table-header">Current Orders</span>
          <Table
            rowSelection={}
            dataSource={currentTableData as []}
            columns={columns as []}
            scroll={scrollSize}
            pagination={false}
            size={'small'}
            bordered={true}
            rowClassName={'highlight-bottom-border highlight-left-border'}
          />
        </div>
        <div className={'orders-table-header-container'}>
          <div className={'options-container'}>
            <button className={'add-btn'} onClick={(e) => handleAddOrder(e)}>
              <img src={PlusIcon} alt={'Add Button'}></img>
              <span className={'add-btn-text'}>View All</span>
            </button>
            {/* AddOrder component and related logic */}
          </div>
        </div>
        <div className="orders-table">
          <span className="custom-table-header">Finished Orders</span>
          <Table
            rowSelection={}
            dataSource={finishedTableData as []}
            columns={columns as []}
            scroll={scrollSize}
            pagination={false}
            size={'small'}
            bordered={true}
            rowClassName={'highlight-bottom-border highlight-left-border'}
          />
        </div>
        <div className={'orders-table-header-container'}>
          <div className={'options-container'}>
            <button className={'add-btn'} onClick={(e) => handleAddOrder(e)}>
              <img src={PlusIcon} alt={'Add Button'}></img>
              <span className={'add-btn-text'}>View All</span>
            </button>
            {/* AddOrder component and related logic */}
          </div>
        </div>
      </div>
    </div>
  );
}
