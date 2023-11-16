import React, { useEffect, useState } from 'react';
import './items.scss';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { Button, Dropdown, Space, Table } from 'antd';
import { DownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import AddUserPopup from './add-user-component/add-item';

export default function Items() {
  const [selectedRole, setSelectedRole] = useState('All');
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [newUserData, setNewUserData] = useState({});

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedRole(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedRole;
  };

  const handleDeleteItem = (record?) => {
    if (selectedRows.length > 0) {
      console.log('delete', selectedRows);
    }
    if (record) {
      console.log('delete', record);
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

  const handleAddItem = (e) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);
    setIsPopupVisible(true);
  };

  const handleEditItem = (record) => {
    console.log('edit', record);
  };

  const hidePopup = () => {
    setIsPopupVisible(false);
  };

  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      name: '',
      price: '',
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
        record.name ? (
          <span className={'table-actions-container'}>
            <EditOutlined
              onClick={() => handleEditItem(record)}
              style={{ color: 'blue', cursor: 'pointer' }}
            />
            <DeleteOutlined
              onClick={() => handleDeleteItem(record)}
              style={{ color: 'red', cursor: 'pointer' }}
            />
          </span>
        ) : null,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
  ];

  const items = [
    {
      label: 'Name',
    },
    {
      label: 'Price',
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
        name: 'Dildo',
        price: '$300',
      },
      {
        key: '2',
        name: 'Dildo',
        price: '$300',
      },
      {
        key: '3',
        name: 'Dildo',
        price: '$300',
      },
    ]);

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  return (
    <div className="items-container">
      <div className={'items-table-container'}>
        <div className={'items-table-header-container'}>
          <span className={'items-table-header'}>ITEMS</span>
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
              onClick={() => handleDeleteItem()}
            ></img>
            <button className={'add-btn'} onClick={(e) => handleAddItem(e)}>
              <img src={PlusIcon} alt={'Add Button'}></img>
              <span className={'add-btn-text'}>Add Item</span>
            </button>
            <AddUserPopup
              hidePopup={hidePopup}
              isPopupVisible={isPopupVisible}
              userData={{ newUserData, setNewUserData }}
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
          rowClassName={'highlight-bottom-border highlight-left-border'}
        />
      </div>
    </div>
  );
}

