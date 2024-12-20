import React, { useEffect, useState } from 'react';
import './users.scss';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { Button, Dropdown, Space, Table } from 'antd';
import { DownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import { companyApi, userApi } from '../../../index';
import debounce from 'lodash.debounce';
import AddUser from './add-user-component/add-user';
import EditUser from './edit-user-component/edit-user';
import { useError } from '../../result-handler-component/error-component/error-context';

export interface IUserData {
  fullName: string;
  role: string;
  phoneNumber: string;
  email: string;
  user_id: number;
}

export default function AdminUsers() {
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [isAddUserVisible, setIsAddUserVisible] = useState(false);
  const [isEditUserVisible, setIsEditUserVisible] = useState(false);
  const [userData, setUserData] = useState({});
  const [companiesData, setCompaniesData] = useState([]);
  const { showError } = useError();
  let filters = {};

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedRole(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedRole;
  };
  const handleMenuCompanyClick: MenuProps['onClick'] = (e) => {
    const selectedCompanyValue = e.domEvent.target.innerText;
    setSelectedCompany(selectedCompanyValue);
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
  };

  const getAllUsers = async (filters: { [key: string]: any }) => {
    const result = await userApi.getAllUsers(filters);
    const users = result.data?.body;
    const dataItems = [];

    const companiesResponse = await companyApi.getAll();

    let companies = [];
    if (companiesResponse.success) {
      companies = companiesResponse.data.body;
    }

    if (users?.length) {
      for (let i = 0; i < users.length; i++) {
        const company = companies.find((company) => {
          return company.company_id === users[i].company;
        });

        dataItems.push({
          key: (i + 1).toString(),
          company: company ? company.company_name : '',
          fullName: users[i].user_name + ' ' + users[i].user_surname,
          role: users[i].user_role,
          phoneNumber: users[i].user_phone,
          email: users[i].user_email,
          user_id: users[i].user_id,
          address: users[i].user_address,
          isPasswordForgotten: users[i].is_password_forgotten,
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

    if (selectedCompany) {
      const company = companiesData.find((company) => {
        return company.company_name === selectedCompany;
      });

      if (company && company.company_name !== 'All') {
        filters.company_id = company.company_id;
      } else {
        if (filters.company_id) {
          delete filters.company_id;
        }
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
      isPasswordForgotten: 0,
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
          <Space size={10}>
            <EditOutlined
              onClick={() => handleEditUser(record)}
              style={{ color: 'blue', cursor: 'pointer' }}
            />
            <DeleteOutlined
              onClick={() => handleDeleteUser(record)}
              style={{ color: 'red', cursor: 'pointer' }}
            />
          </Space>
        ) : null,
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      align: 'center',
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
    {
      label: 'Admin',
    },
    {
      label: 'Vendor',
    },
  ];
  const menuProps = {
    items: items,
    onClick: handleMenuClick,
  };

  const companyProps = {
    items: companiesData.length
      ? companiesData.map((company) => ({ label: company.company_name }))
      : [],
    onClick: handleMenuCompanyClick,
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

    userApi.getAllUsers(filters).then(async (result) => {
      const companiesResponse = await companyApi.getAll();

      let companies = [];
      if (companiesResponse.success) {
        companies = companiesResponse.data.body;
        companies.push({
          company_id: null,
          company_name: 'All',
        });
        setCompaniesData(companies);
      }

      if (!result.success) {
        showError(result.message);
        return;
      }
      const users = result.data?.body;
      const dataItems = [];

      console.log(users);
      if (users?.length) {
        for (let i = 0; i < users.length; i++) {
          const company = companies.find((company) => {
            return company.company_id === users[i].company;
          });

          dataItems.push({
            key: (i + 1).toString(),
            company: company ? company.company_name : '',
            fullName: users[i].user_name + ' ' + users[i].user_surname,
            role: users[i].user_role,
            phoneNumber: users[i].user_phone,
            email: users[i].user_email,
            user_id: users[i].user_id,
            isPasswordForgotten: users[i].is_password_forgotten,
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
    <div className="admin-users-container">
      <div className={'admin-users-table-container'}>
        <div className={'admin-users-table-header-container'}>
          <span className={'admin-users-table-header'}>USERS</span>
          <div className={'admin-users-options-container'}>
            <div className="admin-users-search-bar-container">
              <div className="admin-users-filter">
                <label className="admin-users-filter-labels">Company</label>
                <Dropdown
                  menu={companyProps}
                  className={'admin-users-search-bar-dropdown-container'}
                >
                  <Button>
                    <Space>
                      {selectedCompany}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
              <div className="admin-users-filter">
                <label className="admin-users-filter-labels">Role</label>
                <Dropdown
                  menu={menuProps}
                  className={'admin-users-search-bar-dropdown-container'}
                >
                  <Button>
                    <Space>
                      {selectedRole}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
              <input
                type=""
                className="admin-users-search-bar-input"
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
              />
              <button
                className="admin-users-search-bar-button"
                onClick={(e) => handleSearchClick(e)}
              >
                <img src={SearchIcon} alt={'Search Bar'}></img>
              </button>
            </div>
            <img
              className={
                'admin-users-delete-btn' + ' ' + (deleteBtn ? 'enabled' : '')
              }
              src={deleteBtn ? DeleteButton : DeleteButtonDisabled}
              alt={'Delete Button'}
              onClick={() => handleDeleteUser()}
            ></img>
            <Button
              type={'primary'}
              onClick={handleAddUser}
              style={{
                fontSize: '1vw',
                minHeight: '2.5vw',
              }}
            >
              Add User
            </Button>
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
          className={'admin-users-table'}
          bordered={true}
          style={{ fontSize: '1.5vw' }}
          rowClassName={(record, index) => {
            return record.isPasswordForgotten
              ? 'highlight-bottom-border highlight-left-border custom-row-red-color'
              : 'highlight-bottom-border highlight-left-border';
          }}
        />
      </div>
    </div>
  );
}
