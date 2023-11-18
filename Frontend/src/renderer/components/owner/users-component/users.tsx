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

export interface IUserData {
  fullName: string;
  role: string;
  phoneNumber: string;
  email: string;
  user_id: number;
}

export default function Users() {
  const [selectedRole, setSelectedRole] = useState('All');
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [isAddUserVisible, setIsAddUserVisible] = useState(false);
  const [isEditUserVisible, setIsEditUserVisible] = useState(false);
  const [userData, setUserData] = useState({});
  let filters = {};

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedRole(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedRole;
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

    const response = await userApi.getAllUsers(filters);

    const users = response.data?.body;
    if (users?.length) {
      for (let i = 0; i < users.length; i++) {
        data.push({
          key: (i + 1).toString(),
          fullName: users[i].user_name + ' ' + users[i].user_surname,
          role: users[i].user_role,
          phoneNumber: users[i].user_phone,
          email: users[i].user_email,
          user_id: users[i].user_id,
        });
      }
      setDataSource(data);
    }
  };

  const debouncedSearch = debounce(async (filters) => {
    const response = await userApi.getAllUsers(filters);
    const users = response?.data?.body;
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
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Phone number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
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

    userApi.getAllUsers({}).then((result) => {
      const users = result.data?.body;
      if (users?.length) {
        for (let i = 0; i < users.length; i++) {
          data.push({
            key: (i + 1).toString(),
            fullName: users[i].user_name + ' ' + users[i].user_surname,
            role: users[i].user_role,
            phoneNumber: users[i].user_phone,
            email: users[i].user_email,
            user_id: users[i].user_id,
          });
        }
        setDataSource(data);
      }
    });

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  return (
    <div className="users-container">
      <div className={'users-table-container'}>
        <div className={'users-table-header-container'}>
          <span className={'users-table-header'}>USERS</span>
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
            <img
              className={'delete-btn' + ' ' + (deleteBtn ? 'enabled' : '')}
              src={deleteBtn ? DeleteButton : DeleteButtonDisabled}
              alt={'Delete Button'}
              onClick={() => handleDeleteUser()}
            ></img>
            <button className={'add-btn'} onClick={(e) => handleAddUser(e)}>
              <img src={PlusIcon} alt={'Add Button'}></img>
              <span className={'add-btn-text'}>Add User</span>
            </button>
            <AddUser
              hidePopup={hideAddUser}
              isPopupVisible={isAddUserVisible}
              userData={{ userData: userData, setUserData: setUserData }}
            />
            <EditUser
              hidePopup={hideEditUser}
              isPopupVisible={isEditUserVisible}
              userData={{ userData: userData, setUserData: setUserData }}
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
          className={'users-table'}
          bordered={true}
          style={{ fontSize: '1.5vw' }}
          rowClassName={'highlight-bottom-border highlight-left-border'}
        />
      </div>
    </div>
  );
}
