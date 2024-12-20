import React, { useEffect, useState } from 'react';
import './users.scss';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { Button, Dropdown, Space, Table } from 'antd';
import { DownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import { userApi } from '../../../index';
import debounce from 'lodash.debounce';
import AddUser from './add-user-component/add-user';
import EditUser from './edit-user-component/edit-user';
import { useLoading } from '../../loading-component/loading';
import { useError } from '../../result-handler-component/error-component/error-context';

export interface IUserData {
  fullName: string;
  role: string;
  phoneNumber: string;
  email: string;
  user_id: number;
  address: string;
}

export default function OwnerUsers() {
  const [selectedRole, setSelectedRole] = useState('All');
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [isAddUserVisible, setIsAddUserVisible] = useState(false);
  const [isEditUserVisible, setIsEditUserVisible] = useState(false);
  const [userData, setUserData] = useState({});
  const { startLoading, stopLoading } = useLoading();
  const { showError } = useError();
  let filters = {};

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedRole(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedRole;
  };

  const handleDeleteUser = async (record?) => {
    if (selectedRows.length > 0) {
      startLoading();
      for (let user of selectedRows) {
        const response = await userApi.deleteUser(user.user_id);
        if (!response.success) {
          showError(response.message);
          break;
        }
      }
      stopLoading();
    }
    if (record) {
      startLoading();
      const response = await userApi.deleteUser(record.user_id);
      if (!response.success) {
        showError(response.message);
      }
      stopLoading();
    }

    await getAllUsers(filters);
  };

  const getAllUsers = async (filters: { [key: string]: any }) => {
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
  };
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
    if (selectedRole) {
      filters.user_role = selectedRole.toLowerCase();
    }

    if (selectedRole === 'All' && filters.user_role) {
      delete filters.user_role;
    }

    if (searchValue) {
      filters.user_name_like = searchValue;
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

  const placeholderRowCount = 11;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      fullName: '',
      role: '',
      phoneNumber: '',
      email: '',
      address: '',
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
        record.fullName && record.user_id !== userApi.userData.user_id ? (
          <span className={'table-actions-container'}>
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
      title: 'Full name',
      dataIndex: 'fullName',
      key: 'fullName',
      align: 'center',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
    },
    {
      title: 'Phone number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      align: 'center',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'center',
    },
  ];

  const items = [
    {
      label: 'Supervisor',
    },
    {
      label: 'Manager',
    },
  ];

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      selectedRows = selectedRows.filter((row) => {
        return row.user_id !== userApi.userData.user_id;
      });

      handleRowSelectionChange(selectedRowKeys, selectedRows);
    },

    getCheckboxProps: (record) => ({
      disabled:
        record.user_id === userApi.userData.user_id || record.fullName === '',
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

    userApi.getAllUsers(filters).then((result) => {
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
            address: users[i].user_address,
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
    <div className="warehouses-container">
      <div className={'warehouses-table-container'}>
        <div className={'warehouses-table-header-container'}>
          <span className={'warehouses-table-header'}>USERS</span>
          <div className={'options-container'}>
            <div className="search-bar-container">
              <Dropdown
                menu={menuProps}
                className={'search-bar-dropdown-container'}
              >
                <Button>
                  <Space>
                    {selectedRole}
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
                onClick={() => handleDeleteUser()}
              ></img>
              <Button type={'primary'} onClick={handleAddUser}>
                Add User
              </Button>
            </Space>
            <AddUser
              hidePopup={hideAddUser}
              isPopupVisible={isAddUserVisible}
              userData={{ userData: userData, setUserData: setUserData }}
              onAddUserSuccess={handleAddUserSuccess}
            />
            <EditUser
              hidePopup={hideEditUser}
              isPopupVisible={isEditUserVisible}
              userData={{ userData: userData, setUserData: setUserData }}
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
          className={'warehouses-table'}
          bordered={true}
          style={{ fontSize: '1.5vw' }}
          rowClassName={'highlight-bottom-border highlight-left-border'}
        />
      </div>
    </div>
  );
}
