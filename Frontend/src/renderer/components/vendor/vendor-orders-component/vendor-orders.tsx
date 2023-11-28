import React, { useEffect, useState } from 'react';
import './vendor-orders.scss';
import { Table } from 'antd';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import { orderApi, vendorApi, warehouseApi } from '../../../index';
import { IOrderFilters } from '../../../services/interfaces/ordersInterface';
import debounce from 'lodash.debounce';
import { useNavigate } from 'react-router-dom';
import { IWarehouseData } from '../../owner/warehouses-component/warehouses';
import OrderActiveDetails from './order-detail-component/active-order-detail';

export default function Orders() {
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [currentOrders, setCurrentOrders] = useState([]);
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null); // Track active order id
  const [isOrderDetailsVisible, setOrderDetailsVisible] = useState(false);

  const navigate = useNavigate();
  let filters: IOrderFilters = {};

  const hideOrderDetailsPopup = () => {
    setOrderDetailsVisible(false);
  };

  const getAllOrders = async (filters: IOrderFilters) => {
    const result = await orderApi.getAllOrders(filters);
    const orders = result.data?.body;
    const dataItems = [];
    if (orders?.length) {
      const finishedItems = [];
      const activeItems = [];
      for (let i = 0; i < orders.length; i++) {
        let order = orders[i];
        const vendor = order.order_type === 'to_warehouse' ? order.supplier : order.recipient;

        const warehouse = order.order_type === 'from_warehouse' ? order.supplier : order.recipient;

        const orderItem = {
          key: (i + 1).toString(),
          order_status: orders[i].order_status,
          order_type: orders[i].order_type,
          createdAt: orders[i].created_at,
          order_id: orders[i].order_id,
          vendor: vendor?.vendor_name,
          vendor_id: vendor?.vendor_id,
          warehouse: warehouse?.warehouse_name,
          warehouse_id: warehouse?.warehouse_id
        };


        if (!['finished', 'cancelled'].includes(orderItem.order_status)) {
          activeItems.push(orderItem);
        } else {
          finishedItems.push(orderItem)
        }
      }
      setFinishedOrders(finishedItems);
      setCurrentOrders(activeItems);
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
    navigate('/vendor/orders-add');
  };

  const handleOnCurrentRowClick = (e, record: IWarehouseData, rowIndex) => {
    if (record.order_id && record.order_id !== -1) {
      setActiveOrderId(record.order_id); // Set active order id
      setOrderDetailsVisible(true); // Show the order details modal
    }
  };

  const handleOnFinishRowClick = (e, record: IWarehouseData, rowIndex) => {
    console.log('row', e, record, rowIndex);
  };

  const handleCancelSuccess = async () => {
    await getAllOrders(filters);
  }
  const placeholderRowCount = 5;

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
    {
      title: 'status',
      dataIndex: 'order_status',
      key: 'order_status',
    }
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

    orderApi.getAllOrders(filters).then(async (data) => {
    const orders = data.data?.body;
    const finishedItems = [];
    const activeItems = [];


    if (orders?.length) {
      for (let i = 0; i < orders.length; i++) {
        let order = orders[i];
        const vendor = order.order_type === 'to_warehouse' ? order.supplier : order.recipient;

        const warehouse = order.order_type === 'from_warehouse' ? order.supplier : order.recipient;

        const orderItem = {
          key: (i + 1).toString(),
          order_status: orders[i].order_status,
          order_type: orders[i].order_type,
          createdAt: orders[i].created_at,
          order_id: orders[i].order_id,
          vendor: vendor?.vendor_name,
          vendor_id: vendor?.vendor_id,
          warehouse: warehouse?.warehouse_name,
          warehouse_id: warehouse?.warehouse_id
        };


        if (!['finished', 'cancelled'].includes(orderItem.order_status)) {
          activeItems.push(orderItem);
        } else {
          finishedItems.push(orderItem)
        }
      }
      setFinishedOrders(finishedItems);
      setCurrentOrders(activeItems);
    }
    });

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
            onRow={(record, rowIndex) => {
              return {
                onClick: (event) => handleOnCurrentRowClick(event, record, rowIndex), // click row
              };
            }}
          />
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
            onRow={(record, rowIndex) => {
              return {
                onClick: (event) => handleOnFinishRowClick(event, record, rowIndex), // click row
              };
            }}
          />
        </div>
      </div>
      {activeOrderId && (
        <OrderActiveDetails
          id={activeOrderId}
          onClose={() => setOrderDetailsVisible(false)}
          isActiveOrderVisible={isOrderDetailsVisible}
          onCancelSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
}
