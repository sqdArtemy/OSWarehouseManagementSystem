import React, { useEffect, useState } from 'react';
import './transport.scss';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { Button, Dropdown, Space, Table } from 'antd';
import { DownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import { transportApi, userApi } from '../../../index';
import debounce from 'lodash.debounce';
import AddTransport from './add-transport-component/add-transport';
import EditTransport from './edit-transport-component/edit-transport';
import { useError } from '../../result-handler-component/error-component/error-context';
// import AddUser from './add-user-component/add-user';
// import EditUser from './edit-user-component/edit-user';

export interface ITransportData {
  transportID: string;
  capacity: string;
  maxSpeed: string;
  'price/weight': string;
  type: string;
}

export default function AdminTransport() {
  const [selectedType, setSelectedType] = useState('All');
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [isAddTransportVisible, setIsAddTransportVisible] = useState(false);
  const [isEditTransportVisible, setIsEditTransportVisible] = useState(false);
  const [transportData, setTransportData] = useState({});
  const { showError } = useError();

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedType(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedType;
  };

  const handeDeleteTransport = async (record?) => {
    if (selectedRows.length > 0) {
      console.log('delete', selectedRows);
      for (let transport of selectedRows) {
        const response = await transportApi.deleteTransport(
          transport.transportID,
        );
        if (!response.success) {
          showError(response.message);
        }
      }
    }
    if (record) {
      console.log('delete', record);
      const response = await transportApi.deleteTransport(record.transportID);
      if (!response.success) {
        showError(response.message);
      }
    }

    await debouncedSearch({});
  };

  const handleSuccessAdd = async () => {
    await debouncedSearch({});
  };

  const debouncedSearch = debounce(async (filters) => {
    const response = await transportApi.getAllTransports(filters);
    const transports = response?.data?.body;
    const dataItems = [];

    if (transports?.length) {
      for (let i = 0; i < transports.length; i++) {
        data.push({
          key: (i + 1).toString(),
          transportID: transports[i].transport_id,
          capacity: transports[i].transport_capacity,
          maxSpeed: transports[i].transport_speed,
          price_weight: transports[i].price_per_weight,
          type: transports[i].transport_type,
        });
      }
      setDataSource(data);
    } else {
      setDataSource([]);
    }
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
      filters.transport_type = selectedType.toLowerCase();
    }

    if (selectedType === 'All' && filters.transport_type) {
      delete filters.transport_type;
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

  const handleAddTransport = (e) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);
    setIsAddTransportVisible(true);
  };

  const handleEditTransport = (record) => {
    console.log('edit', record);
    setTransportData(record);
    setIsEditTransportVisible(true);
  };

  const hideAddTransport = () => {
    setIsAddTransportVisible(false);
  };

  const hideEditTransport = () => {
    setIsEditTransportVisible(false);
  };

  const placeholderRowCount = 5;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      transportID: '',
      capacity: '',
      maxSpeed: '',
      'price/weight': '',
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
        record.transportID ? (
          <span className={'table-actions-container'}>
            <EditOutlined
              onClick={() => handleEditTransport(record)}
              style={{ color: 'blue', cursor: 'pointer' }}
            />
            <DeleteOutlined
              onClick={() => handeDeleteTransport(record)}
              style={{ color: 'red', cursor: 'pointer' }}
            />
          </span>
        ) : null,
    },
    {
      title: 'Transport ID',
      dataIndex: 'transportID',
      key: 'transportID',
      align: 'center',
    },
    {
      title: 'Capacity m³',
      dataIndex: 'capacity',
      key: 'capacity',
      align: 'center',
    },
    {
      title: 'Max Speed',
      dataIndex: 'maxSpeed',
      key: 'maxSpeed',
      align: 'center',
    },
    {
      title: 'Price/weight ($/kg)',
      dataIndex: 'price_weight',
      key: 'price_weight',
      align: 'center',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
    },
  ];

  const items = [
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

  const menuProps = {
    items: items,
    onClick: handleMenuClick,
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      handleRowSelectionChange(selectedRowKeys, selectedRows);
    },

    getCheckboxProps: (record) => ({
      disabled: record.transportID === '',
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

    transportApi.getAllTransports({}).then((result) => {
      const transports = result.data?.body;
      if (transports?.length) {
        for (let i = 0; i < transports.length; i++) {
          data.push({
            key: (i + 1).toString(),
            transportID: transports[i].transport_id,
            capacity: transports[i].transport_capacity,
            maxSpeed: transports[i].transport_speed,
            price_weight: transports[i].price_per_weight,
            type: transports[i].transport_type,
          });
        }
        setDataSource(data);
      }
    });

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  return (
    <div className="admin-transport-container">
      <div className={'admin-transport-table-container'}>
        <div className={'admin-transport-table-header-container'}>
          <span className={'admin-transport-table-header'}>TRANSPORT</span>
          <div className={'admin-transport-options-container'}>
            <div className="admin-transport-search-bar-container">
              <Dropdown
                menu={menuProps}
                className={'admin-transport-search-bar-dropdown-container'}
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
                className="admin-transport-search-bar-input"
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
              />
              <button
                className="admin-transport-search-bar-button"
                onClick={(e) => handleSearchClick(e)}
              >
                <img src={SearchIcon} alt={'Search Bar'}></img>
              </button>
            </div>
            <img
              className={
                'admin-transport-delete-btn' +
                ' ' +
                (deleteBtn ? 'enabled' : '')
              }
              src={deleteBtn ? DeleteButton : DeleteButtonDisabled}
              alt={'Delete Button'}
              onClick={() => handeDeleteTransport()}
            ></img>
            <Button
              type={'primary'}
              onClick={handleAddTransport}
              style={{ fontSize: '1vw', minHeight: '2.5vw' }}
            >
              Add Transport
            </Button>
            <AddTransport
              hidePopup={hideAddTransport}
              isPopupVisible={isAddTransportVisible}
              warehouseData={{
                transportData: transportData,
                setTransportData: setTransportData,
              }}
              onAddSuccess={handleSuccessAdd}
            />
            <EditTransport
              hidePopup={hideEditTransport}
              isPopupVisible={isEditTransportVisible}
              transportData={{
                transportData: transportData,
                setTransportData: setTransportData,
              }}
              onEditSuccess={handleSuccessAdd}
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
          className={'admin-transport-table'}
          bordered={true}
          style={{ fontSize: '1.5vw' }}
          rowClassName={'highlight-bottom-border highlight-left-border'}
        />
      </div>
    </div>
  );
}
