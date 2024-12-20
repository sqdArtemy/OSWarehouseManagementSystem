import React, { useEffect, useState } from 'react';
import './warehouses.scss';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { Button, Dropdown, Space, Table } from 'antd';
import { DownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import { userApi, warehouseApi } from '../../../index';
import debounce from 'lodash.debounce';
import AddWarehouse from './add-warehouse-component/add-warehouse';
import EditWarehouse from './edit-warehouse-component/edit-warehouse';
import { IWarehouseFilters } from '../../../services/interfaces/warehouseInterface';
import { useError } from '../../result-handler-component/error-component/error-context';
import { useNavigate } from 'react-router-dom';
// import AddUser from './add-user-component/add-user';
// import EditUser from './edit-user-component/edit-user';

export interface IWarehouseData {
  warehouseName: string;
  capacity: string;
  supervisor: string;
  type: string;
  address: number;
  warehouse_id?: number;
}

export default function OwnerWarehouses() {
  const [selectedType, setSelectedType] = useState('All');
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [actionClicked, setActionClicked] = useState(false);
  const [isAddWarehouseVisible, setIsAddWarehouseVisible] = useState(false);
  const [isEditWarehouseVisible, setIsEditWarehouseVisible] = useState(false);
  const [warehouseData, setWarehouseData] = useState({});
  const { showError } = useError();
  const navigate = useNavigate();
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedType(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedType;
  };

  const handeDeleteWarehouse = async (record?) => {
    if (record) {
      console.log('delete', record);
      const response = await warehouseApi.deleteWarehouse(record.warehouse_id);
      if (!response.success) {
        showError(response.message);
        return;
      }
      setDataSource(dataSource.filter((item) => item.key !== record.key));
    }
  };

  const debouncedSearch = debounce(async (filters) => {
    await getAllWarehouses(filters);
    // }
  }, 1000);
  let filters: IWarehouseFilters = {};
  const handleSearchClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);

    if (selectedType) {
      filters.warehouse_type = selectedType.toLowerCase();
    }

    if (selectedType === 'All' && filters.warehouse_type) {
      delete filters.warehouse_type;
    }

    if (searchValue) {
      filters.warehouse_name_like = searchValue;
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
    // console.log('edit', record);
    setWarehouseData(record);
    setIsEditWarehouseVisible(true);
  };

  const hideAddWarehouse = () => {
    setIsAddWarehouseVisible(false);
  };

  const hideEditWarehouse = () => {
    setIsEditWarehouseVisible(false);
  };

  const onAddWarehouseSuccess = async () => {
    await getAllWarehouses(filters);
  };

  const getAllWarehouses = async (filters: IWarehouseFilters) => {
    const response = await warehouseApi.getAllWarehouses(filters);
    const warehouses = response.data?.body;
    const data = [];
    let allUsers = [];
    const usersResponse = await userApi.getAllUsers({});
    if (usersResponse.success) {
      allUsers = usersResponse.data.body;
    }
    if (warehouses?.length) {
      for (let i = 0; i < warehouses.length; i++) {
        const user = allUsers?.find(
          (user) => user.user_id === warehouses[i].supervisor,
        );
        data.push({
          key: (i + 1).toString(),
          warehouseName: warehouses[i].warehouse_name,
          supervisor: user.user_name + ' ' + user.user_surname,
          address: warehouses[i].warehouse_address,
          type: warehouses[i].warehouse_type,
          capacity:
            warehouses[i].remaining_capacity +
            '/' +
            warehouses[i].overall_capacity,
          warehouse_id: warehouses[i].warehouse_id,
          overall_capacity: warehouses[i].overall_capacity,
          remaining_capacity: warehouses[i].remaining_capacity,
        });
      }
      setDataSource(data);
    } else {
      setDataSource([]);
    }
  };

  const placeholderRowCount = 11;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      address: '',
      capacity: '',
      warehouseName: '',
      supervisor: '',
      type: '',
      warehouse_id: -1,
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
      title: 'Suprevisor',
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
      title: 'Capacity (m³)',
      dataIndex: 'capacity',
      key: 'capacity',
      align: 'center',
    },
  ];

  const items = [
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

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      handleRowSelectionChange(selectedRowKeys, selectedRows);
    },

    getCheckboxProps: (record) => ({
      disabled: record.warehouseName === '',
    }),
  };

  const handleOnRowClick = (e, record: IWarehouseData, rowIndex) => {
    console.log('row', e, record, rowIndex);
    console.dir(e.target);
    if (
      e.target.tagName === 'TD' &&
      e.target.children.length > 0 &&
      e.target.children[0].classList.contains('table-actions-container')
    ) {
      return;
    } else {
      console.log('check');
      if (!Boolean(e.target.closest('.table-actions-container'))) {
        if (record.warehouse_id !== -1)
          navigate(`/owner/warehouses/${record.warehouse_id}`, {
            state: {
              locWarehouseData: record,
            },
          });
      }
    }
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

    warehouseApi.getAllWarehouses({}).then(async (result) => {
      const warehouses = result.data?.body;
      if (warehouses?.length) {
        let allUsers = [];
        const response = await userApi.getAllUsers({});
        if (response.success) {
          allUsers = response.data.body;
        }
        for (let i = 0; i < warehouses.length; i++) {
          const user = allUsers?.find(
            (user) => user.user_id === warehouses[i].supervisor,
          );
          data.push({
            key: (i + 1).toString(),
            warehouseName: warehouses[i].warehouse_name,
            supervisor: user ? user.user_name + ' ' + user.user_surname : '',
            address: warehouses[i].warehouse_address,
            type: warehouses[i].warehouse_type,
            capacity:
              warehouses[i].remaining_capacity +
              '/' +
              warehouses[i].overall_capacity,
            warehouse_id: warehouses[i].warehouse_id,
            overall_capacity: warehouses[i].overall_capacity,
            remaining_capacity: warehouses[i].remaining_capacity,
          });
        }
        setDataSource(data);
      }
    });

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  return (
    <div className="warehouses-container">
      <div className={'warehouses-table-container'}>
        <div className={'warehouses-table-header-container'}>
          <span className={'warehouses-table-header'}>WAREHOUSES</span>
          <div className={'options-container'}>
            <div className="search-bar-container">
              <Dropdown
                menu={menuProps}
                className={'search-bar-dropdown-container'}
              >
                <Button>
                  <Space>
                    {selectedType}
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
              <input
                type=""
                className="search-bar-input"
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
              />
              <button
                className="search-bar-button"
                onClick={(e) => handleSearchClick(e)}
              >
                <img src={SearchIcon} alt={'Search Bar'}></img>
              </button>
            </div>
            <Space direction={'horizontal'} size={70}>
              <img
                className={'delete-btn' + ' ' + (deleteBtn ? 'enabled' : '')}
                src={deleteBtn ? DeleteButton : DeleteButtonDisabled}
                alt={'Delete Button'}
                onClick={() => handeDeleteWarehouse()}
              ></img>
              <Button type={'primary'} onClick={handleAddWarehouse}>
                Add Warehouse
              </Button>
            </Space>
            <AddWarehouse
              hidePopup={hideAddWarehouse}
              isPopupVisible={isAddWarehouseVisible}
              warehouseData={{
                warehouseData: warehouseData,
                setWarehouseData: setWarehouseData,
              }}
              onAddWarehouseSuccess={onAddWarehouseSuccess}
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
          className={'warehouses-table'}
          bordered={true}
          style={{ fontSize: '1.5vw' }}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => handleOnRowClick(event, record, rowIndex), // click row
            };
          }}
          rowClassName={(record) =>
            record.warehouseName
              ? 'highlight-bottom-border highlight-left-border selectable'
              : 'highlight-bottom-border highlight-left-border'
          }
        />
      </div>
    </div>
  );
}
