import React, { useEffect, useState } from 'react';
import './orders.scss';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { Button, Dropdown, Space, Table, DatePicker } from 'antd';
import { DownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import { userApi } from '../../../index';
import debounce from 'lodash.debounce';
import EditOrders from './edit-orders-component/edit-orders';

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
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [isAddTransportVisible, setIsAddTransportVisible] = useState(false);
  const [isEditTransportVisible, setIsEditTransportVisible] = useState(false);
  const [orderData, setOrdersData] = useState({});

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedTransportType(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedTransportType;
  };
  const handleStatusClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedStatus(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedStatus;
  };
  const handleFromToWarehouseClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedType(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedType;
  };

  const handeDeleteOrder = async (record?) => {
    // if (selectedRows.length > 0) {
    //   console.log('delete', selectedRows);
    //   for (let user of selectedRows) {
    //     await userApi.deleteUser(user.user_id);
    //   }
    // }
    if (record) {
      console.log('delete', record);
      await userApi.deleteUser(record.user_id);
    }
  };

  const debouncedSearch = debounce(async (filters) => {
    // const response = await userApi.getAllUsers(filters);
    // const users = response?.data?.body;
    // const dataItems = [];
    //
    // if (users?.length) {
    //   for (let i = 0; i < users.length; i++) {
    //     dataItems.push({
    //       key: (i + 1).toString(),
    //       fullName: users[i].user_name + ' ' + users[i].user_surname,
    //       role: users[i].user_role,
    //       phoneNumber: users[i].user_phone,
    //       email: users[i].user_phone,
    //       user_id: users[i].user_id,
    //     });
    //   }
    //
    //   setDataSource(dataItems);
    // } else {
    setDataSource([]);
    // }
  }, 1000);

  const handleSearchClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);

    const filters = {};
    if (selectedTransportType) {
      filters.user_role = selectedTransportType.toLowerCase();
    }

    if (selectedTransportType === 'All' && filters.user_role) {
      delete filters.user_role;
    }

    if (searchValue) {
      filters.user_name = searchValue;
    }
    debouncedSearch(filters);
  };

  const handleRowSelectionChange = (selectedRowKeys, selectedRows) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      'selectedRows: ',
      selectedRows,
    );
    setSelectedRows(selectedRows);
    if (selectedRows.length > 0) {
      setDeleteBtn(true);
    } else {
      setDeleteBtn(false);
    }
  };


  const handleEditOrder = (record) => {
    console.log('edit', record);
    setOrdersData(record);
    setIsEditTransportVisible(true);
  };

  const hideAddTransport = () => {
    setIsAddTransportVisible(false);
  };

  const hideEditTransport = () => {
    setIsEditTransportVisible(false);
  };

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
            <DeleteOutlined
              onClick={() => handeDeleteOrder(record)}
              style={{ color: 'red', cursor: 'pointer' }}
            />
          </span>
        ) : null,
    },
    {
      title: 'From',
      dataIndex: 'fromWarehouse',
      key: 'fromWarehouse',
      align: 'center',
    },
    {
      title: 'To',
      dataIndex: 'toWarehouse',
      key: 'toWarehouse',
      align: 'center',
    },
    {
      title: 'Price',
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
  ]
  const fromToWarehouse = [
    {
      label: 'From Warehouse',
    },
    {
      label: 'To Warehouse'
    }
  ]

  const transportTypesProps = {
    items: transport_types,
    onClick: handleMenuClick,
  };
  const orderStatusProps = {
    items: order_statuses,
    onClick: handleStatusClick,
  }
  const orderTypeProps = {
    items: fromToWarehouse,
    onClick: handleFromToWarehouseClick,
  }

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      handleRowSelectionChange(selectedRowKeys, selectedRows);
    },

    getCheckboxProps: (record) => ({
      disabled: record.warehouseName === '',
    }),
  };

  let data = [];
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

    // userApi.getAllUsers({}).then((result) => {
    //   const users = result.data?.body;
    //   if (users?.length) {
    //     for (let i = 0; i < users.length; i++) {
    //       data.push({
    //         key: (i + 1).toString(),
    //         fullName: users[i].user_name + ' ' + users[i].user_surname,
    //         role: users[i].user_role,
    //         phoneNumber: users[i].user_phone,
    //         email: users[i].user_phone,
    //         user_id: users[i].user_id,
    //       });
    //     }
    //     setDataSource(data);
    //   }
    // });

    setDataSource([
      {
        key: '1',
        fromWarehouse: 'Dick.inc',
        toWarehouse: 'Cock.inc',
        amount: '6969',
        price: '9696',
        created_at: '2023-12-31',
        transport_type: 'Van',
        status: 'Finished',
      },
    ]);

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
                <label className="admin-orders-filter-duration-labels">Date From</label>
                <DatePicker
                  className={'admin-orders-datepicker'}
                  size={'small'}
                  bordered={true}
                />
              </div>
              <div className="admin-orders-filter">
                <label className="admin-orders-filter-duration-labels">Date To</label>
                <DatePicker
                  className={'admin-orders-datepicker'}
                  size={'small'}
                  bordered={true}
                />
              </div>
            </div>
            <img
              className={'admin-orders-delete-btn' + ' ' + (deleteBtn ? 'enabled' : '')}
              src={deleteBtn ? DeleteButton : DeleteButtonDisabled}
              alt={'Delete Button'}
              onClick={() => handeDeleteOrder()}
            ></img>
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
          rowSelection={{
            ...rowSelection,
          }}
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
