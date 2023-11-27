import React, { useEffect, useState } from 'react';
import './transport.scss';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { Button, Dropdown, Space, Table } from 'antd';
import { DownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import { userApi } from '../../../index';
import debounce from 'lodash.debounce';
import AddTransport from './add-transport-component/add-transport';
import EditTransport from './edit-transport-component/edit-transport';
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

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedType(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedType;
  };

  const handeDeleteTransport = async (record?) => {
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

  const placeholderRowCount = 30;

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
      title: 'Capacity',
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
      title: 'Price/weight',
      dataIndex: 'price_weight',
      key: 'price_weight',
      align: 'center',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align: 'type',
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
        transportID: 'John Brown',
        capacity: '32',
        maxSpeed: 'New York No. 1 Lake Park',
        price_weight: 'Freezer',
        type: 1000,
      },
      {
        key: '2',
        transportID: 'John Brown',
        capacity: '32',
        maxSpeed: 'New York No. 1 Lake Park',
        price_weight: 'Freezer',
        type: 1000,
      },
      {
        key: '3',
        transportID: 'John Brown',
        capacity: '32',
        maxSpeed: 'New York No. 1 Lake Park',
        price_weight: 'Freezer',
        type: 1000,
      },
      {
        key: '4',
        transportID: 'John Brown',
        capacity: '32',
        maxSpeed: 'New York No. 1 Lake Park',
        price_weight: 'Freezer',
        type: 1000,
      },
    ]);

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  return (
    <div className="admin-transport-container">
      <div className={'admin-transport-table-container'}>
        <div className={'admin-transport-table-header-container'}>
          <span className={'admin-transport-table-header'}>Transport</span>
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
              className={'admin-transport-delete-btn' + ' ' + (deleteBtn ? 'enabled' : '')}
              src={deleteBtn ? DeleteButton : DeleteButtonDisabled}
              alt={'Delete Button'}
              onClick={() => handeDeleteTransport()}
            ></img>
            <button
              className={'admin-transport-add-btn'}
              onClick={(e) => handleAddTransport(e)}
            >
              <img src={PlusIcon} alt={'Add Button'}></img>
              <span className={'admin-transport-add-btn-text'}>Add Transport</span>
            </button>
            <AddTransport
              hidePopup={hideAddTransport}
              isPopupVisible={isAddTransportVisible}
              warehouseData={{
                transportData: transportData,
                setTransportData: setTransportData,
              }}
            />
            <EditTransport
              hidePopup={hideEditTransport}
              isPopupVisible={isEditTransportVisible}
              transportData={{
                transportData: transportData,
                setTransportData: setTransportData,
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
          className={'admin-transport-table'}
          bordered={true}
          style={{ fontSize: '1.5vw' }}
          rowClassName={'highlight-bottom-border highlight-left-border'}
        />
      </div>
    </div>
  );
}
