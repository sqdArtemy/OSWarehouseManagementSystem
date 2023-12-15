import React, { useEffect, useState } from 'react';
import './orders.scss';
import type { MenuProps } from 'antd';
import { Button, DatePicker, Dropdown, Space, Table } from 'antd';
import { DownOutlined, EditOutlined } from '@ant-design/icons';
import { orderApi, transportApi } from '../../../index';
import debounce from 'lodash.debounce';
import EditOrders from './edit-orders-component/edit-orders';
import moment from 'moment';

export interface IOrderData {
  fromWarehouse: string;
  toWarehouse: string;
  amount: string;
  price: string;
  created_at: string;
  transport_type: string;
  status: string;
}

export default function AdminOrders() {
  const [selectedTransportType, setSelectedTransportType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [dataSource, setDataSource] = useState([]);
  const [isEditTransportVisible, setIsEditTransportVisible] = useState(false);
  const [orderData, setOrdersData] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const filters = {};
  const handleMenuClick: MenuProps['onClick'] = async (e) => {
    setSelectedTransportType(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedTransportType;
  };

  const handleStatusClick: MenuProps['onClick'] = async (e) => {
    setSelectedStatus(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedStatus;
  };

  const handleFromToWarehouseClick: MenuProps['onClick'] = async (e) => {
    setSelectedType(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedType;
  };

  const handleEditOrder = (record) => {
    setOrdersData(record);
    setIsEditTransportVisible(true);
  };

  const hideEditTransport = () => {
    setIsEditTransportVisible(false);
  };

  const handleSearch = async () => {
    const filters = {};

    if (selectedStatus.toLowerCase() === 'all') {
      delete filters.order_status;
    } else {
      filters.order_status = selectedStatus.toLowerCase();
    }

    const transportsResponse = await transportApi.getAllTransports({});
    if (transportsResponse.success) {
      const transports = transportsResponse.data.body;

      const transport = transports.find((transport) => {
        return (
          transport.transport_type.toLowerCase() ===
          selectedTransportType.toLowerCase()
        );
      });

      if (transport) {
        filters.transport_id = transport.transport_id;
      } else {
        if (filters.transport_id) {
          delete filters.transport_id;
        }
      }
    }

    if (selectedType === 'All') {
      delete filters.order_type;
    } else if (selectedType.includes('From')) {
      filters.order_type = 'from_warehouse';
    } else {
      filters.order_type = 'to_warehouse';
    }

    if (startDate) {
      filters.created_at_gte = moment(startDate['$d'] as any).format(
        'YYYY-MM-DD',
      );
    }

    if (endDate) {
      filters.created_at_lte = moment(endDate['$d'] as any).format(
        'YYYY-MM-DD',
      );
    }

    await getAllOrders(filters);
  };

  const getAllOrders = async (filters) => {
    const response = await orderApi.getAllOrders(filters);
    const orders = response.data?.body;
    const dataSource = [];
    let transports = [];

    const transportsResponse = await transportApi.getAllTransports({});
    if (transportsResponse.success) {
      transports = transportsResponse.data.body;
    }

    if (orders?.length) {
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
        const transport = transports.find((transport) => {
          return transport.transport_id === order.transport;
        });

        dataSource.push({
          key: (i + 1).toString(),
          status: orders[i].order_status,
          order_type: orders[i].order_type,
          created_at: orders[i].created_at,
          order_id: orders[i].order_id,
          vendor: vendor?.vendor_name,
          vendor_id: vendor?.vendor_id,
          warehouse: warehouse?.warehouse_name,
          warehouse_id: warehouse?.warehouse_id,
          transport_type: transport ? transport.transport_type : 'No transport',
          price: order.total_price,
        });
      }
      setDataSource(dataSource);
    } else {
      setDataSource([]);
    }
  };

  const debouncedSearch = debounce(async (filters) => {
    await getAllOrders(filters);
  }, 1000);
  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      fromWarehouse: '',
      toWarehouse: '',
      amount: '',
      price: '',
      created_at: '',
      transport_type: '',
      status: '',
    }),
  );

  let tableData = dataSource.length > 0 ? dataSource : placeholderData;
  if (tableData.length < placeholderRowCount) {
    tableData = [...tableData, ...placeholderData.slice(tableData.length + 1)];
  }

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '10%',
      align: 'center',
      render: (_, record) =>
        record.status ? (
          <span className={'table-actions-container'}>
            <EditOutlined
              onClick={() => handleEditOrder(record)}
              style={{ color: 'blue', cursor: 'pointer' }}
            />
          </span>
        ) : null,
    },
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
      title: 'Price $',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
    },
    {
      title: 'Date(created)',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
    },
    {
      title: 'Transport',
      dataIndex: 'transport_type',
      key: 'transport_type',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
    },
  ];

  const transport_types = [
    {
      label: 'Truck',
    },
    {
      label: 'Van',
    },
    {
      label: 'Car',
    },
  ];
  const order_statuses = [
    {
      label: 'Lost',
    },
    {
      label: 'Damaged',
    },
    {
      label: 'New',
    },
    {
      label: 'Processing',
    },
    {
      label: 'Delivered',
    },
    {
      label: 'Submitted',
    },
    {
      label: 'Finished',
    },
    {
      label: 'Cancelled',
    },
  ];
  const fromToWarehouse = [
    {
      label: 'From Warehouse',
    },
    {
      label: 'To Warehouse',
    },
  ];

  const transportTypesProps = {
    items: transport_types,
    onClick: handleMenuClick,
  };
  const orderStatusProps = {
    items: order_statuses,
    onClick: handleStatusClick,
  };
  const orderTypeProps = {
    items: fromToWarehouse,
    onClick: handleFromToWarehouseClick,
  };

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
      const dataSource = [];
      let transports = [];

      const transportsResponse = await transportApi.getAllTransports({});
      if (transportsResponse.success) {
        transports = transportsResponse.data.body;
      }

      if (orders?.length) {
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
          const transport = transports.find((transport) => {
            return transport.transport_id === order.transport;
          });

          dataSource.push({
            key: (i + 1).toString(),
            status: orders[i].order_status,
            order_type: orders[i].order_type,
            created_at: orders[i].created_at,
            order_id: orders[i].order_id,
            vendor: vendor?.vendor_name,
            vendor_id: vendor?.vendor_id,
            warehouse: warehouse?.warehouse_name,
            warehouse_id: warehouse?.warehouse_id,
            transport_type: transport
              ? transport.transport_type
              : 'No transport',
            price: order.total_price,
          });
        }
        setDataSource(dataSource);
      } else {
        setDataSource([]);
      }
    });

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  return (
    <div className="admin-orders-container">
      <div className={'admin-orders-table-container'}>
        <div className={'admin-orders-table-header-container'}>
          <span className={'admin-orders-table-header'}>ORDERS</span>
          <div className={'admin-orders-options-container'}>
            <div className="admin-orders-search-bar-container">
              <div className="admin-orders-filter">
                <label className="admin-orders-filter-labels">Status</label>
                <Dropdown
                  menu={orderStatusProps}
                  className={'admin-orders-search-bar-dropdown-container'}
                >
                  <Button>
                    <Space>
                      {selectedStatus}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
              <div className="admin-orders-filter">
                <label className="admin-orders-filter-labels">Transport</label>
                <Dropdown
                  menu={transportTypesProps}
                  className={'admin-orders-search-bar-dropdown-container'}
                >
                  <Button>
                    <Space>
                      {selectedTransportType}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
              <div className="admin-orders-filter">
                <label className="admin-orders-filter-labels">Type</label>
                <Dropdown
                  menu={orderTypeProps}
                  className={'admin-orders-search-bar-dropdown-container'}
                >
                  <Button>
                    <Space>
                      {selectedType}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
              <div className="admin-orders-filter">
                <label className="admin-orders-filter-duration-labels">
                  Date From
                </label>
                <DatePicker
                  className={'admin-orders-datepicker'}
                  size={'small'}
                  bordered={true}
                  onChange={(date) => setStartDate(date)}
                />
              </div>
              <div className="admin-orders-filter">
                <label className="admin-orders-filter-duration-labels">
                  Date To
                </label>
                <DatePicker
                  className={'admin-orders-datepicker'}
                  size={'small'}
                  bordered={true}
                  onChange={(date) => setEndDate(date)}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
            <EditOrders
              hidePopup={hideEditTransport}
              isPopupVisible={isEditTransportVisible}
              orderData={{
                ordersData: orderData,
                setOrdersData: setOrdersData,
              }}
            />
          </div>
        </div>
        <Table
          rowSelection={{}}
          dataSource={tableData as []}
          columns={columns as []}
          scroll={scrollSize}
          pagination={false}
          size={'small'}
          className={'admin-orders-table'}
          bordered={true}
          style={{ fontSize: '1.5vw' }}
          rowClassName={'highlight-bottom-border highlight-left-border'}
        />
      </div>
    </div>
  );
}
