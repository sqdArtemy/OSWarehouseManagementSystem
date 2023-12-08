import React, { useEffect, useState } from 'react';
import './orders.scss';
import { Table } from 'antd';
import PlusIcon from '../../../../assets/icons/users-plus-icon.png';
import { orderApi, userApi, vendorApi, warehouseApi } from '../../index';
import { IOrderFilters } from '../../services/interfaces/ordersInterface';
import debounce from 'lodash.debounce';
import { useNavigate } from 'react-router-dom';
import { IWarehouseData } from '../owner/warehouses-component/warehouses';
import OrderActiveDetails from './order-detail-component/active-order-detail';
import { DatePicker } from 'antd';

const { RangePicker } = DatePicker;

export default function Orders() {
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [currentOrders, setCurrentOrders] = useState([]);
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null); // Track active order id
  const [isOrderDetailsVisible, setOrderDetailsVisible] = useState(false);
  const [dates, setDates] = useState([]);

  const navigate = useNavigate();
  let filters: IOrderFilters = {};

  const hideOrderDetailsPopup = () => {
    setOrderDetailsVisible(false);
  };

  const getAllOrders = async (filters: IOrderFilters) => {
    const result = await orderApi.getAllOrders(filters);
    const orders = result.data?.body;

    if (orders?.length) {
      const finishedItems = [];
      const activeItems = [];
      let activeKey = 0;
      let finishKey = 0;
      for (let i = 0; i < orders.length; i++) {
        let order = orders[i];
        const vendor =
          order.order_type === 'to_warehouse'
            ? order.supplier
            : order.recipient;
        const warehouse =
          order.order_type === 'from_warehouse'
            ? order.supplier
            : order.recipient;

        const orderItem = {
          order_status: orders[i].order_status,
          order_type: orders[i].order_type,
          createdAt: orders[i].created_at,
          order_id: orders[i].order_id,
          vendor: vendor?.vendor_name,
          vendor_id: vendor?.vendor_id,
          warehouse: warehouse?.warehouse_name,
          warehouse_id: warehouse?.warehouse_id,
        };

        if (!['finished', 'cancelled'].includes(orderItem.order_status)) {
          orderItem.key = (activeKey++).toString();
          activeItems.push(orderItem);
        } else {
          orderItem.key = (finishKey++).toString();
          finishedItems.push(orderItem);
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
    if (record.order_id && record.order_id !== -1) {
      setActiveOrderId(record.order_id); // Set active order id
      setOrderDetailsVisible(true); // Show the order details modal
    }
  };

  const handleCancelSuccess = async () => {
    await getAllOrders(filters);
  };

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

  let currentTableData =
    currentOrders.length > 0 ? currentOrders : placeholderData;
  if (currentTableData.length < placeholderRowCount) {
    currentTableData = [
      ...currentTableData,
      ...placeholderData.slice(currentTableData.length + 1),
    ];
  }

  let finishedTableData =
    finishedOrders.length > 0 ? finishedOrders : placeholderData;
  if (finishedTableData.length < placeholderRowCount) {
    finishedTableData = [
      ...finishedTableData,
      ...placeholderData.slice(finishedTableData.length + 1),
    ];
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
        y: vh * 0.175,
      });
    };

    calculateScrollSize();
    window.addEventListener('resize', calculateScrollSize);

    orderApi.getAllOrders(filters).then(async (data) => {
      const orders = data.data?.body;
      console.log(orders);

      if (orders?.length) {
        const finishedItems = [];
        const activeItems = [];
        let activeKey = 0;
        let finishKey = 0;
        for (let i = 0; i < orders.length; i++) {
          let order = orders[i];
          const vendor =
            order.order_type === 'to_warehouse'
              ? order.supplier
              : order.recipient;
          const warehouse =
            order.order_type === 'from_warehouse'
              ? order.supplier
              : order.recipient;

          const orderItem = {
            order_status: orders[i].order_status,
            order_type: orders[i].order_type,
            createdAt: orders[i].created_at,
            order_id: orders[i].order_id,
            vendor: vendor?.vendor_name,
            vendor_id: vendor?.vendor_id,
            warehouse: warehouse?.warehouse_name,
            warehouse_id: warehouse?.warehouse_id,
          };

          if (!['finished', 'cancelled'].includes(orderItem.order_status)) {
            orderItem.key = (activeKey++).toString();
            activeItems.push(orderItem);
          } else {
            orderItem.key = (finishKey++).toString();
            finishedItems.push(orderItem);
          }
        }

        setFinishedOrders(finishedItems);
        setCurrentOrders(activeItems);
      } else {
        setCurrentOrders([]);
        setFinishedOrders([]);
      }
    });

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  const ordersStatsColumns = [
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'New',
      dataIndex: 'new',
      key: 'new',
    },
    {
      title: 'Finished',
      dataIndex: 'finished',
      key: 'finished',
    },
    {
      title: 'Cancelled',
      dataIndex: 'cancelled',
      key: 'cancelled',
    },
    {
      title: 'Processing',
      dataIndex: 'processing',
      key: 'processing',
    },
    {
      title: 'Delivered',
      dataIndex: 'delivered',
      key: 'delivered',
    },
    {
      title: 'Lost',
      dataIndex: 'lost',
      key: 'lost',
    },
    {
      title: 'Submitted',
      dataIndex: 'submitted',
      key: 'submitted',
    },
    {
      title: 'Damaged',
      dataIndex: 'damaged',
      key: 'damaged',
    },
  ];

  const ordersStatsTableData = [
    {
      key: '1',
      total: currentOrders.length + finishedOrders.length,
      new: currentOrders.length,
      finished: finishedOrders.length,
      cancelled: 0,
      processing: 0,
      delivered: 0,
      lost: 0,
      submitted: 0,
      damaged: 0,
    },
  ];

  return (
    <div className="orders-container">
      <div className={'orders-table-container'}>
        <div className={'orders-table-header-container'}>
          <span className={'orders-table-header'}>ORDERS</span>
          <div className={'orders-options-container'}>
            {userApi.getUserData &&
              userApi.getUserData.user_role === 'vendor' && (
                <>
                  <RangePicker
                    allowEmpty={[true, true]}
                    onChange={(dates) => setDates(dates)}
                    className={'orders-date-picker'}
                  />
                  <button
                    className={'add-btn'}
                    onClick={(e) => handleAddOrder(e)}
                  >
                    <img src={PlusIcon} alt={'Add Button'}></img>
                    <span className={'add-btn-text'}>Add Order</span>
                  </button>
                </>
              )}
          </div>
        </div>
        <div className="orders-table">
          <span className="custom-table-header">Current Orders</span>
          <Table
            dataSource={currentTableData as []}
            columns={columns as []}
            scroll={scrollSize}
            pagination={false}
            size={'small'}
            bordered={true}
            rowClassName={
              'highlight-bottom-border highlight-left-border default-table-row-height selectable'
            }
            onRow={(record, rowIndex) => {
              return {
                onClick: (event) =>
                  handleOnCurrentRowClick(event, record, rowIndex), // click row
              };
            }}
          />
        </div>
        <div className="orders-table">
          <span className="custom-table-header">Finished Orders</span>
          <Table
            dataSource={finishedTableData as []}
            columns={columns as []}
            scroll={scrollSize}
            pagination={false}
            size={'small'}
            bordered={true}
            rowClassName={
              'highlight-bottom-border highlight-left-border default-table-row-height selectable'
            }
            onRow={(record, rowIndex) => {
              return {
                onClick: (event) =>
                  handleOnFinishRowClick(event, record, rowIndex), // click row
              };
            }}
          />
        </div>
        <div className="orders-stats-table">
          <Table
            title={() => (
              <p
                style={{
                  fontSize: '1.1vw',
                  textAlign: 'center',
                  maxHeight: '1vw',
                }}
              >
                Orders Status Statistics (All Time)
              </p>
            )}
            dataSource={ordersStatsTableData as []}
            columns={ordersStatsColumns as []}
            pagination={false}
            size={'small'}
            bordered={true}
            style={{ fontSize: '0.8vw' }}
            rootClassName={'orders-stats-table'}
            rowClassName={'default-table-row-height'}
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
