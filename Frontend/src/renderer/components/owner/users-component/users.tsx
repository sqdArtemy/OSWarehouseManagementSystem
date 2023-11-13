import React, { useEffect, useState } from 'react';
import './users.scss';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { Button, Dropdown, Space, Table } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';

export default function Users() {
  const [selectedRole, setSelectedRole] = useState('All');
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [dataSource, setDataSource] = useState([]);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedRole(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedRole;
  };

  const handleDelete = () => {
    if (selectedRows.length > 0) {
      console.log('delete', selectedRows);
    }
  };

  const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);
    console.log('search', searchValue);
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

  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      fullName: '',
      duty: '',
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
      title: 'Full name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Duty',
      dataIndex: 'duty',
      key: 'duty',
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
      label: 'Shipper',
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

    setDataSource([
      {
        key: '1',
        fullName: 'Mike',
        duty: 'Shipper',
        phoneNumber: '123456789',
        email: '1213@abc.com',
      },
      {
        key: '2',
        fullName: 'Jesse',
        duty: 'Manager',
        phoneNumber: '987654321',
        email: '3311@abc.com',
      },
      {
        key: '3',
        fullName: 'Mike',
        duty: 'Shipper',
        phoneNumber: '123456789',
        email: '1213@mmal.com',
      },
    ]);

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
              onClick={() => handleDelete()}
            ></img>
            <button
              className={'add-btn'}
              onClick={(e) => {
                setTimeout(() => {
                  if (e.target instanceof HTMLButtonElement) e.target.blur();
                  else {
                    (e.target as HTMLImageElement).parentElement?.blur();
                  }
                }, 100);
              }}
            >
              <img src={PlusIcon} alt={'Add Button'}></img>
              <span className={'add-btn-text'}>Add User</span>
            </button>
          </div>
        </div>
        <Table
          rowSelection={{
            ...rowSelection,
          }}
          dataSource={tableData as []}
          columns={columns}
          scroll={scrollSize}
          pagination={false}
          size={'small'}
          className={'users-table'}
          bordered={true}
          rowClassName={'highlight-bottom-border highlight-left-border'}
        />
      </div>
    </div>
  );
}
