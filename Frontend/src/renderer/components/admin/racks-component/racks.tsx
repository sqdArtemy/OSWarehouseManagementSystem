import React, { useEffect, useState } from 'react';
import './racks.scss';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { Button, Dropdown, Space, Table } from 'antd';
import { DownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import { rackApi, warehouseApi } from '../../../index';
import debounce from 'lodash.debounce';
import AddRack from './add-racks-component/add-racks';
import EditRack from './edit-racks-component/edit-racks';
import { IRackFilter } from '../../../services/interfaces/rackInterface';
import { useLoading } from '../../loading-component/loading';

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
  const [isAddRackVisible, setIsAddRackVisible] = useState(false);
  const [isEditRackVisible, setIsEditRackVisible] = useState(false);
  const [RackData, setRackData] = useState({});
  const [warehouseData, setWarehouseData] = useState([]);
  const { startLoading, stopLoading } = useLoading();
  let filters = {};

  const handleMenuWarehouseClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedWarehouse(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedWarehouse;
  };

  const handleDeleteRack = async (record?) => {
    if (selectedRows.length > 0) {
      console.log('delete', selectedRows);
      for (let rack of selectedRows) {
        await rackApi.deleteRack(Rack.rack_id);
      }
    }
    if (record) {
      console.log('delete', record);
      await rackApi.deleteRack(record.rack_id);
    }

    await getAllRacks(filters);
  };

  const getAllRacks = async (filters: IRackFilter) => {
    startLoading();
    const result = await rackApi.getAll(filters);
    const racks = result.data?.body;
    const dataItems = [];

    let warehouses = [];
    const warehousesResponse = await warehouseApi.getAllWarehouses({});

    if (warehousesResponse.success) {
      warehouses = warehousesResponse.data.body;
    }

    if (racks?.length) {
      for (let i = 0; i < racks.length; i++) {
        const warehouse = warehouses.find((warehouse) => {
          return warehouse.warehouse_id === racks[i].warehouse;
        });

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
    stopLoading();
  };

  const debouncedSearch = debounce(async (filters) => {
    await getAllRacks(filters);
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
      filters.rack_position = searchValue;
    }

    if (selectedWarehouse) {
      const warehouses = warehouseData;
      const warehouse = warehouseData.find((warehouse) => {
        return warehouse.warehouse_name === selectedWarehouse;
      });

      if (warehouse) {
        filters.warehouse_id = warehouse.warehouse_id;
      } else {
        delete filters.warehouse_id;
      }
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

  const handleAddRack = (e) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);
    setIsAddRackVisible(true);
  };

  const handleAddRackSuccess = async () => {
    await getAllRacks(filters);
  };

  const handleEditRackSuccess = async () => {
    await getAllRacks(filters);
  };

  const handleEditRack = (record) => {
    console.log('edit', record);
    setRackData(record);
    setIsEditRackVisible(true);
  };

  const hideAddRack = () => {
    setIsAddRackVisible(false);
  };

  const hideEditRack = () => {
    setIsEditRackVisible(false);
  };

  let tableData = dataSource.length > 0 ? dataSource : [];

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '10%',
      align: 'center',
      render: (_, record) =>
        record.rackPosition ? (
          <Space direction={'horizontal'} size={25}>
            <EditOutlined
              onClick={() => handleEditRack(record)}
              style={{ color: 'blue', cursor: 'pointer' }}
            />
            <DeleteOutlined
              onClick={() => handleDeleteRack(record)}
              style={{ color: 'red', cursor: 'pointer' }}
            />
          </Space>
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
      title: 'Overall Capacity (m³)',
      dataIndex: 'overallCapacity',
      key: 'overallCapacity',
      align: 'center',
    },
  ];

  const warehouseProps = {
    items: warehouseData.length
      ? warehouseData.map((warehouse) => ({ label: warehouse.warehouse_name }))
      : [],
    onClick: handleMenuWarehouseClick,
  };

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

    startLoading();
    rackApi.getAll(filters).then(async (result) => {
      const racks = result.data?.body;
      const dataItems = [];

      let warehouses = [];
      const warehousesResponse = await warehouseApi.getAllWarehouses({});

      if (warehousesResponse.success) {
        warehouses = warehousesResponse.data.body;
        setWarehouseData(warehouses);
      }

      if (racks?.length) {
        for (let i = 0; i < racks.length; i++) {
          const warehouse = warehouses.find((warehouse) => {
            return warehouse.warehouse_id === racks[i].warehouse;
          });

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
      stopLoading();
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
              className={
                'admin-racks-delete-btn' + ' ' + (deleteBtn ? 'enabled' : '')
              }
              src={deleteBtn ? DeleteButton : DeleteButtonDisabled}
              alt={'Delete Button'}
              onClick={() => handleDeleteRack()}
            ></img>
            <Button
              type={'primary'}
              onClick={handleAddRack}
              style={{ fontSize: '1vw', minHeight: '2.5vw' }}
            >
              Add Rack
            </Button>
            <AddRack
              hidePopup={hideAddRack}
              isPopupVisible={isAddRackVisible}
              racksData={{ racksData: RackData, setRacksData: setRackData }}
              onAddRackSuccess={handleAddRackSuccess}
            />
            <EditRack
              hidePopup={hideEditRack}
              isPopupVisible={isEditRackVisible}
              racksData={{ racksData: RackData, setRacksData: setRackData }}
              onEditRackSuccess={handleEditRackSuccess}
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
