import React, { useEffect, useState } from 'react';
import './warehouses.scss';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { Button, Dropdown, Select, Space, Table } from "antd";
import { DownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import { userApi } from '../../../index';
import debounce from 'lodash.debounce';
import AddWarehouse from './add-warehouse-component/add-warehouse';
import EditWarehouse from './edit-warehouse-component/edit-warehouse';
// import AddUser from './add-user-component/add-user';
// import EditUser from './edit-user-component/edit-user';

export interface IWarehouseData {
  warehouseName: string;
  capacity: string;
  supervisor: string;
  type: string;
  address: number;
}

export default function AdminWarehouses() {
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [isAddWarehouseVisible, setIsAddWarehouseVisible] = useState(false);
  const [isEditWarehouseVisible, setIsEditWarehouseVisible] = useState(false);
  const [warehouseData, setWarehouseData] = useState({});

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedType(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedType;
  };
  const handleMenuCompanyClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    console.log(e.domEvent.target.innerText)
    setSelectedCompany(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedCompany;
  };

  const handeDeleteWarehouse = async (record?) => {
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
    if (selectedType) {
      filters.user_role = selectedType.toLowerCase();
    }

    if (selectedType === 'All' && filters.user_role) {
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

  const handleAddWarehouse = (e) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);
    setIsAddWarehouseVisible(true);
  };

  const handleEditWarehouse = (record) => {
    console.log('edit', record);
    setWarehouseData(record);
    setIsEditWarehouseVisible(true);
  };

  const hideAddWarehouse = () => {
    setIsAddWarehouseVisible(false);
  };

  const hideEditWarehouse = () => {
    setIsEditWarehouseVisible(false);
  };

  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      address: '',
      capacity: '',
      warehouseName: '',
      supervisor: '',
      type: '',
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
        record.warehouseName ? (
          <span className={'table-actions-container'}>
            <EditOutlined
              onClick={() => handleEditWarehouse(record)}
              style={{ color: 'blue', cursor: 'pointer' }}
            />
            <DeleteOutlined
              onClick={() => handeDeleteWarehouse(record)}
              style={{ color: 'red', cursor: 'pointer' }}
            />
          </span>
        ) : null,
    },
    {
      title: 'Company name',
      dataIndex: 'companyName',
      key: 'companyName',
      align: 'center',
    },
    {
      title: 'Warehouse name',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      align: 'center',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      align: 'center',
    },
    {
      title: 'Supervisor',
      dataIndex: 'supervisor',
      key: 'supervisor',
      align: 'center',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      align: 'center',
    },
  ];

  const types = [
    {
      label: 'Freezer',
    },
    {
      label: 'Refrigerator',
    },
    {
      label: 'Dry',
    },
    {
      label: 'Hazardous',
    },
  ];
  const companies = [
    {
      label: 'Cock.inc',
    },
    {
      label: 'SOmething',
    },
  ]

  const menuProps = {
    items: types,
    onClick: handleMenuClick,
  };
  const menuCompanyProps = {
    items: companies,
    onClick: handleMenuCompanyClick,
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
        companyName: 'Cock.inc',
        warehouseName: 'John Brown',
        supervisor: '32',
        address: 'New York No. 1 Lake Park',
        type: 'Freezer',
        capacity: 1000,
      },
      {
        key: '2',
        companyName: 'Cock.inc',
        warehouseName: 'Jim Green',
        supervisor: '42',
        address: 'London No. 1 Lake Park',
        type: 'Refrigerator',
        capacity: 1000,
      },
      {
        key: '3',
        companyName: 'Cock.inc',
        warehouseName: 'Joe Black',
        supervisor: '32',
        address: 'Sidney No. 1 Lake Park',
        type: 'Dry',
        capacity: 1000,
      },
      {
        key: '4',
        companyName: 'Cock.inc',
        warehouseName: 'Disabled User',
        supervisor: '99',
        address: 'Sidney No. 1 Lake Park',
        type: 'Hazardous',
        capacity: 1000,
      },
    ]);

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  return (
    <div className="admin-warehouses-container">
      <div className={'admin-warehouses-table-container'}>
        <div className={'admin-warehouses-table-header-container'}>
          <span className={'admin-warehouses-table-header'}>WAREHOUSES</span>
          <div className={'admin-options-container'}>
            <div className="admin-search-bar-container">
              <div className="admin-warehouse-filter">
                <label className="admin-warehouse-filter-labels">Company</label>
                <Dropdown
                  menu={menuCompanyProps}
                  className={'admin-search-bar-dropdown-container'}
                >
                  <Button>
                    <Space>
                      {selectedCompany}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
              <div className="admin-warehouse-filter">
              <label className="admin-warehouse-filter-labels">Type</label>
              <Dropdown
                menu={menuProps}
                className={'admin-search-bar-dropdown-container'}
              >
                <Button>
                  <Space>
                    {selectedType}
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
              </div>
              <input
                type=""
                className="admin-search-bar-input"
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
              />
              <button
                className="admin-search-bar-button"
                onClick={(e) => handleSearchClick(e)}
              >
                <img src={SearchIcon} alt={'Search Bar'}></img>
              </button>
            </div>
            <img
              className={'admin-delete-btn' + ' ' + (deleteBtn ? 'enabled' : '')}
              src={deleteBtn ? DeleteButton : DeleteButtonDisabled}
              alt={'Delete Button'}
              onClick={() => handeDeleteWarehouse()}
            ></img>
            <button
              className={'admin-add-btn'}
              onClick={(e) => handleAddWarehouse(e)}
            >
              <img src={PlusIcon} alt={'Add Button'}></img>
              <span className={'admin-add-btn-text'}>Add Warehouse</span>
            </button>
            <AddWarehouse
              hidePopup={hideAddWarehouse}
              isPopupVisible={isAddWarehouseVisible}
              warehouseData={{
                warehouseData: warehouseData,
                setWarehouseData: setWarehouseData,
              }}
            />
            <EditWarehouse
              hidePopup={hideEditWarehouse}
              isPopupVisible={isEditWarehouseVisible}
              warehouseData={{
                warehouseData: warehouseData,
                setWarehouseData: setWarehouseData,
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
          className={'admin-warehouses-table'}
          bordered={true}
          style={{ fontSize: '1.5vw' }}
          rowClassName={'highlight-bottom-border highlight-left-border'}
        />
      </div>
    </div>
  );
}
