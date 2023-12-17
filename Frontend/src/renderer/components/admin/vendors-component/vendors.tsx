import React, { useEffect, useState } from 'react';
import './vendors.scss'; // Update the stylesheet path
import { Button, Dropdown, Space, Table } from 'antd';
import { EditOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { userApi, vendorApi } from '../../../index'; // Import your vendor API
import { IVendorFilters } from '../../../services/interfaces/vendorInterface'; // Import the vendor interface
import debounce from 'lodash.debounce';
import AddVendor from './add-vendor-component/add-vendor'; // Create an AddVendor component similar to AddItem
import EditVendor from './edit-vendor-component/edit-vendor'; // Create an EditVendor component similar to EditItem
import { useError } from '../../result-handler-component/error-component/error-context';

export default function AdminVendors() {
  const [selectedType, setSelectedType] = useState('All');
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchVendorName, setSearchVendorName] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const [newVendorData, setNewVendorData] = useState({});

  const { showError } = useError();

  let filters: IVendorFilters = {};

  const handleDeleteVendor = async (record?) => {
    if (selectedRows.length > 0) {
      console.log('delete', selectedRows);
      for (let vendor of selectedRows) {
        const response = await vendorApi.deleteVendor(vendor.vendor_id);
        if (!response.success) {
          showError(response.message);
        }
      }
    }
    if (record) {
      console.log('delete', record);
      const response = await vendorApi.deleteVendor(record.vendor_id);
      if (!response.success) {
        showError(response.message);
      }
    }

    await getAllVendors(filters);
  };

  const handleVendorNameInputChange = (e) => {
    setSearchVendorName(e.target.value);
  };

  const handleSearchVendorClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);

    if (searchVendorName) {
      filters.vendor_name_like = searchVendorName;
    } else {
      if (!filters.vendor_name_like) delete filters.vendor_name_like;
    }

    if (selectedType) {
      if (selectedType.toLowerCase() === 'government')
        filters.is_government = 1;
      else if (selectedType.toLowerCase() === 'private')
        filters.is_government = 0;
      else delete filters.is_government;
    } else {
      delete filters.is_government;
    }
    console.log(filters);
    await debouncedSearch(filters);
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

  const handleAddVendor = (e) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);
    setIsPopupVisible(true);
  };

  const handleEditVendor = (record) => {
    console.log('edit', record);
    setNewVendorData(record);
    setIsEditPopupVisible(true);
  };

  const hideAddPopup = () => {
    setIsPopupVisible(false);
  };

  const hideEditPopup = () => {
    setIsEditPopupVisible(false);
  };

  const getAllVendors = async (filters: IVendorFilters) => {
    const result = await vendorApi.getAllVendors(filters);
    const vendors = result.data?.body;
    const dataItems = [];
    let users = [];

    const usersResponse = await userApi.getAllUsers({});

    if (usersResponse.success) {
      users = usersResponse.data.body;
    }

    if (vendors?.length) {
      for (let i = 0; i < vendors.length; i++) {
        const user = users.find((user) => {
          return user.user_id === vendors[i].vendor_owner?.user_id;
        });
        dataItems.push({
          key: (i + 1).toString(),
          owner: user ? user.user_name + ' ' + user.user_surname : '',
          vendor_name: vendors[i].vendor_name,
          vendor_address: vendors[i].vendor_address,
          is_government: vendors[i].is_government,
          vendor_id: vendors[i].vendor_id,
          is_government_display: vendors[i].is_government
            ? 'Government'
            : 'Private',
          vendor_owner_id: vendors[i].vendor_owner.user_id,
        });
      }

      setDataSource(dataItems);
    } else {
      setDataSource([]);
    }
  };

  const debouncedSearch = debounce(async (filters) => {
    await getAllVendors(filters);
  }, 1000);

  const handleAddVendorSuccess = async () => {
    await getAllVendors(filters);
  };

  const handleEditVendorSuccess = async () => {
    await getAllVendors(filters);
  };

  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      vendor_name: '',
      vendor_address: '',
      is_government: '',
      is_government_display: '',
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
        record.vendor_name ? (
          <span className={'admin-vendors-table-actions-container'}>
            <EditOutlined
              onClick={() => handleEditVendor(record)}
              style={{ color: 'blue', cursor: 'pointer' }}
            />
            <DeleteOutlined
              onClick={() => handleDeleteVendor(record)}
              style={{ color: 'red', cursor: 'pointer' }}
            />
          </span>
        ) : null,
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      align: 'center',
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      align: 'center',
    },
    {
      title: 'Vendor Address',
      dataIndex: 'vendor_address',
      key: 'vendor_address',
      align: 'center',
    },
    {
      title: 'Vendor Type',
      dataIndex: 'is_government_display',
      key: 'is_government_display',
      align: 'center',
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      handleRowSelectionChange(selectedRowKeys, selectedRows);
    },

    getCheckboxProps: (record) => ({
      disabled: record.vendor_name === '',
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

    vendorApi.getAllVendors({}).then(async (result) => {
      const vendors = result.data?.body;
      const dataItems = [];
      let users = [];

      const usersResponse = await userApi.getAllUsers({});

      if (!usersResponse.success) {
        return showError(usersResponse.message);
      }
      users = usersResponse.data.body;
      if (vendors?.length) {
        for (let i = 0; i < vendors.length; i++) {
          const user = users.find((user) => {
            console.log(user.user_id, vendors[i]);
            return user.user_id === vendors[i].vendor_owner
              ? vendors[i].vendor_owner.user_id
              : -1;
          });

          dataItems.push({
            key: (i + 1).toString(),
            owner: user ? user.user_name + ' ' + user.user_surname : '',
            vendor_name: vendors[i].vendor_name,
            vendor_address: vendors[i].vendor_address,
            is_government: vendors[i].is_government,
            vendor_id: vendors[i].vendor_id,
            is_government_display: vendors[i].is_government
              ? 'Government'
              : 'Private',
            vendor_owner_id: vendors[i].vendor_owner
              ? vendors[i].vendor_owner.user_id
              : -1,
          });
        }

        setDataSource(dataItems);
      } else {
        setDataSource([]);
      }
    });

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  const handleMenuTypeClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectedType(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectedType;
  };

  const types = [
    {
      label: 'Government',
    },
    {
      label: 'Private',
    },
  ];

  const typesProps = {
    items: types,
    onClick: handleMenuTypeClick,
  };

  return (
    <div className="admin-vendors-container">
      <div className={'admin-vendors-table-container'}>
        <div className={'admin-vendors-table-header-container'}>
          <span className={'admin-vendors-table-header'}>VENDORS</span>
          <div className={'admin-vendors-options-container'}>
            <div className="admin-vendors-search-bar-container">
              <div className="admin-vendors-filter">
                <label className="admin-vendors-filter-labels">Type</label>
                <Dropdown
                  menu={typesProps}
                  className={'admin-vendors-search-bar-dropdown-container'}
                >
                  <Button>
                    <Space>
                      {selectedType}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
              <input
                type=""
                className="admin-vendors-search-bar-input"
                onChange={(e) => {
                  setSearchVendorName(e.target.value);
                }}
              />
              <button
                className="admin-vendors-search-bar-button"
                onClick={(e) => handleSearchVendorClick(e)}
              >
                <img src={SearchIcon} alt={'Search Bar'}></img>
              </button>
            </div>
            <img
              className={
                'admin-vendors-delete-btn' + ' ' + (deleteBtn ? 'enabled' : '')
              }
              src={deleteBtn ? DeleteButton : DeleteButtonDisabled}
              alt={'Delete Button'}
              onClick={() => handleDeleteVendor()}
            ></img>
            <Button
              type={'primary'}
              onClick={handleAddVendor}
              style={{ fontSize: '1vw', minHeight: '2.5vw' }}
            >
              Add Vendor
            </Button>
            <AddVendor
              hidePopup={hideAddPopup}
              isPopupVisible={isPopupVisible}
              vendorData={{ newVendorData, setNewVendorData }}
              onAddVendorSuccess={handleAddVendorSuccess}
            />
            <EditVendor
              hidePopup={hideEditPopup}
              isEditPopupVisible={isEditPopupVisible}
              vendorData={{
                editVendorData: newVendorData,
                setEditVendorData: setNewVendorData,
              }}
              onEditVendorSuccess={handleEditVendorSuccess}
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
          className={'admin-vendors-table'}
          bordered={true}
          rowClassName={'highlight-bottom-border highlight-left-border'}
        />
      </div>
    </div>
  );
}
