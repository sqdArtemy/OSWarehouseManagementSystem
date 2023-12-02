import React, { useEffect, useState } from 'react';
import './racks.scss';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { Button, Dropdown, Space, Table } from 'antd';
import { DownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import { rackApi, userApi, warehouseApi } from '../../../index';
import debounce from 'lodash.debounce';
import AddRack from './add-racks-component/add-racks';
import EditRack from './edit-racks-component/edit-racks';

export interface IRacksData {
  warehouse: string;
  rackPosition: string;
  overallCapacity: string;
}

export default function AdminRacks() {
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [isAddUserVisible, setIsAddUserVisible] = useState(false);
  const [isEditUserVisible, setIsEditUserVisible] = useState(false);
  const [userData, setUserData] = useState({});
  let filters = {};

  const handleMenuCompanyClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedWarehouse(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedWarehouse;
  };

  const handleDeleteUser = async (record?) => {
    if (selectedRows.length > 0) {
      console.log('delete', selectedRows);
      for (let user of selectedRows) {
        await userApi.deleteUser(user.user_id);
      }
    }
    if (record) {
      console.log('delete', record);
      await userApi.deleteUser(record.user_id);
    }

    await getAllUsers(filters);
  }

  const getAllUsers = async (filters: {[key: string]: any}) => {
    const result = await userApi.getAllUsers(filters);
    const users = result.data?.body;
    const dataItems = [];

    if (users?.length) {
      for (let i = 0; i < users.length; i++) {
        dataItems.push({
          key: (i + 1).toString(),
          fullName: users[i].user_name + ' ' + users[i].user_surname,
          role: users[i].user_role,
          phoneNumber: users[i].user_phone,
          email: users[i].user_email,
          user_id: users[i].user_id,
        });
      }

      setDataSource(dataItems);
    } else {
      setDataSource([]);
    }
  }
  const debouncedSearch = debounce(async (filters) => {
    await getAllUsers(filters);
  }, 1000);

  const handleSearchClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);

    filters = {};

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

  const handleAddUser = (e) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);
    setIsAddUserVisible(true);
  };

  const handleAddUserSuccess = async () => {
    await getAllUsers(filters);
  };

  const handleEditUserSuccess = async () => {
    await getAllUsers(filters);
  };

  const handleEditUser = (record) => {
    console.log('edit', record);
    setUserData(record);
    setIsEditUserVisible(true);
  };

  const hideAddUser = () => {
    setIsAddUserVisible(false);
  };

  const hideEditUser = () => {
    setIsEditUserVisible(false);
  };

  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      fullName: '',
      role: '',
      phoneNumber: '',
      email: '',
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
        record.fullName ? (
          <span className={'admin-table-actions-container'}>
            <EditOutlined
              onClick={() => handleEditUser(record)}
              style={{ color: 'blue', cursor: 'pointer' }}
            />
            <DeleteOutlined
              onClick={() => handleDeleteUser(record)}
              style={{ color: 'red', cursor: 'pointer' }}
            />
          </span>
        ) : null,
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouse',
      key: 'warehouse',
      align: 'center',
    },
    {
      title: 'Rack Position',
      dataIndex: 'rackPosition',
      key: 'rackPosition',
      align: 'center',
    },
    {
      title: 'Overall Capacity (m^3)',
      dataIndex: 'overallCapacity',
      key: 'overallCapacity',
      align: 'center',
    },

  ];
  const companies = [
    {
      label: 'dick.inc',
    }
  ]

  const warehouseProps = {
    items: companies,
    onClick: handleMenuCompanyClick,
  }

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      handleRowSelectionChange(selectedRowKeys, selectedRows);
    },

    getCheckboxProps: (record) => ({
      disabled: record.fullName === '',
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

    rackApi.getAll(filters).then(async (result) =>{
      const racks = result.data?.body;
      const dataItems = [];

      let warehouses = [];
      const warehousesResponse = await warehouseApi.getAllWarehouses({});

      if(warehousesResponse.success){
        warehouses = warehousesResponse.data.body;
      }

      if (racks?.length) {
        for (let i = 0; i < racks.length; i++) {
          const warehouse = warehouses.find(warehouse => {
            return warehouse.warehouse_id === racks[i].warehouse;
          })

          dataItems.push({
            key: (i + 1).toString(),
            warehouse: warehouse ? warehouse.warehouse_name : '',
            rackPosition: racks[i].rack_position,
            overallCapacity: racks[i].overall_capacity,
            rack_id: racks[i].rack_id,
          });
        }

        setDataSource(dataItems);
      } else {
        setDataSource([]);
      }
    });

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  return (
    <div className="admin-racks-container">
      <div className={'admin-racks-table-container'}>
        <div className={'admin-racks-table-header-container'}>
          <span className={'admin-racks-table-header'}>RACKS</span>
          <div className={'admin-racks-options-container'}>
            <div className="admin-racks-search-bar-container">
              <div className="admin-racks-filter">
                <label className="admin-racks-filter-labels">Warehouse</label>
                <Dropdown
                  menu={warehouseProps}
                  className={'admin-racks-search-bar-dropdown-container'}
                >
                  <Button>
                    <Space>
                      {selectedWarehouse}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
              <input
                type=""
                className="admin-racks-search-bar-input"
                placeholder="Position of rack"
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
              />
              <button
                className="admin-racks-search-bar-button"
                onClick={(e) => handleSearchClick(e)}
              >
                <img src={SearchIcon} alt={'Search Bar'}></img>
              </button>
            </div>
            <img
              className={'admin-racks-delete-btn' + ' ' + (deleteBtn ? 'enabled' : '')}
              src={deleteBtn ? DeleteButton : DeleteButtonDisabled}
              alt={'Delete Button'}
              onClick={() => handleDeleteUser()}
            ></img>
            <button className={'admin-racks-add-btn'} onClick={(e) => handleAddUser(e)}>
              <img src={PlusIcon} alt={'Add Button'}></img>
              <span className={'add-btn-text'}>Add Rack</span>
            </button>
            <AddRack
              hidePopup={hideAddUser}
              isPopupVisible={isAddUserVisible}
              racksData={{ racksData: userData, setRacksData: setUserData }}
              onAddUserSuccess={handleAddUserSuccess}
            />
            <EditRack
              hidePopup={hideEditUser}
              isPopupVisible={isEditUserVisible}
              racksData={{ racksData: userData, setRacksData: setUserData }}
              onEditUserSuccess={handleEditUserSuccess}
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
          className={'admin-racks-table'}
          bordered={true}
          style={{ fontSize: '1.5vw' }}
          rowClassName={'highlight-bottom-border highlight-left-border'}
        />
      </div>
    </div>
  );
}
