import React, { useEffect, useState } from 'react';
import './vendors.scss'; // Update the stylesheet path
import { Button, Space, Table } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { vendorApi } from '../../../index'; // Import your vendor API
import { IVendorFilters } from '../../../services/interfaces/vendorInterface'; // Import the vendor interface
import debounce from 'lodash.debounce';
import AddVendor from './add-vendor-component/add-vendor'; // Create an AddVendor component similar to AddItem
import EditVendor from './edit-vendor-component/edit-vendor'; // Create an EditVendor component similar to EditItem
import { useError } from '../../result-handler-component/error-component/error-context';

export default function Vendors() {
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

    if (vendors?.length) {
      for (let i = 0; i < vendors.length; i++) {
        dataItems.push({
          key: (i + 1).toString(),
          vendor_name: vendors[i].vendor_name,
          vendor_address: vendors[i].vendor_address,
          is_government: vendors[i].is_government,
          is_government_display: vendors[i].is_government
            ? 'Government'
            : 'Private',
          vendor_id: vendors[i].vendor_id,
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
          <span className={'table-actions-container'}>
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
      title: 'Vendor Name',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
    },
    {
      title: 'Vendor Address',
      dataIndex: 'vendor_address',
      key: 'vendor_address',
    },
    {
      title: 'Vendor Type',
      dataIndex: 'is_government_display',
      key: 'is_government_display',
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

    vendorApi.getAllVendors(filters).then((result) => {
      const vendors = result.data?.body;
      const dataItems = [];

      if (vendors?.length) {
        for (let i = 0; i < vendors.length; i++) {
          dataItems.push({
            key: (i + 1).toString(),
            vendor_name: vendors[i].vendor_name,
            vendor_address: vendors[i].vendor_address,
            is_government: vendors[i].is_government,
            vendor_id: vendors[i].vendor_id,
            is_government_display: vendors[i].is_government
              ? 'Government'
              : 'Private',
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
    <div className="vendors-container">
      <div className={'vendors-table-container'}>
        <div className={'vendors-table-header-container'}>
          <span className={'vendors-table-header'}>VENDORS</span>
          <div className={'options-container'}>
            <div className="search-bar-container">
              <input
                type=""
                className="search-bar-input"
                onChange={(e) => {
                  setSearchVendorName(e.target.value);
                }}
              />
              <button
                className="search-bar-button"
                onClick={(e) => handleSearchVendorClick(e)}
              >
                <img src={SearchIcon} alt={'Search Bar'}></img>
              </button>
            </div>
            <Space direction={'horizontal'} size={70}>
              <img
                className={'delete-btn' + ' ' + (deleteBtn ? 'enabled' : '')}
                src={deleteBtn ? DeleteButton : DeleteButtonDisabled}
                alt={'Delete Button'}
                onClick={() => handleDeleteVendor()}
              ></img>
              <Button type={'primary'} onClick={handleAddVendor}>
                Add Vendor
              </Button>
            </Space>
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
          className={'vendors-table'}
          bordered={true}
          rowClassName={'highlight-bottom-border highlight-left-border'}
        />
      </div>
    </div>
  );
}
