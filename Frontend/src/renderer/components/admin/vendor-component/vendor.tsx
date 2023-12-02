import React, { useEffect, useState } from 'react';
import './vendor.scss';
import SearchIcon from '../../../../../assets/icons/search-bar-icon.png';
import { Button, Dropdown, Space, Table } from 'antd';
import { DownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import DeleteButtonDisabled from '../../../../../assets/icons/users-delete-btn-disabled.png';
import DeleteButton from '../../../../../assets/icons/users-delete-btn.png';
import PlusIcon from '../../../../../assets/icons/users-plus-icon.png';
import AddItem from './add-user-component/add-item';
import { productApi, userApi } from '../../../index';
import { IProductFilters } from '../../../services/interfaces/productsInterface';
import debounce from 'lodash.debounce';
import EditUser from '../users-component/edit-user-component/edit-user';
import EditItem from './edit-user-component/edit-item';

export default function AdminVendors() {
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchVolumeValue, setSearchVolumeValue] = useState('');
  const [searchWeightValue, setSearchWeightValue] = useState('');
  const [selectVolumeValue, setSelectVolumeValue] = useState('<=');
  const [selectWeightValue, setSelectWeightValue] = useState('<=');
  const [dataSource, setDataSource] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const [newItemData, setNewItemData] = useState({});

  let filters: IProductFilters = {};

  const handleWeightClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectWeightValue(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectVolumeValue;
  };

  const handleVolumeClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
    setSelectVolumeValue(e.domEvent.target.innerText);
    e.domEvent.target.innerText = selectWeightValue;
  };

  const handleDeleteItem = async (record?) => {
    if (selectedRows.length > 0) {
      console.log('delete', selectedRows);
      for (let user of selectedRows) {
        await productApi.deleteProduct(user.product_id);
      }
    }
    if (record) {
      console.log('delete', record);
      await productApi.deleteProduct(record.product_id);
    }

    await getAllProducts(filters);
  };

  const handleWeightInputChange = (e) => {
    setSearchWeightValue(e.target.value);
  };

  const handleVolumeInputChange = (e) => {
    setSearchVolumeValue(e.target.value);
  };


  const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTimeout(() => {
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      else {
        (e.target as HTMLImageElement).parentElement?.blur();
      }
    }, 100);

    if(searchValue){
      filters.product_name_like = searchValue;
    } else {
      if(!filters.product_name_like) delete filters.product_name_like;
    }

    if (searchVolumeValue) {
      filters.volume_lte = selectVolumeValue === '<=' ? Number(searchVolumeValue) : undefined;
      filters.volume_gte = selectVolumeValue === '>=' ? Number(searchVolumeValue) : undefined;
    }

    if (searchWeightValue) {
      filters.weight_lte = selectWeightValue === '<=' ? Number(searchWeightValue) : undefined;
      filters.weight_gte = selectWeightValue === '>=' ? Number(searchWeightValue) : undefined;
    }

    console.log(filters);
    debouncedSearch(filters);
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
    setNewItemData(record);
    setIsEditPopupVisible(true);
  };

  const hideAddPopup = () => {
    setIsPopupVisible(false);
  };

  const hideEditPopup = () => {
    setIsEditPopupVisible(false);
  };

  const getAllProducts = async (filters: IProductFilters) => {
    const result = await productApi.getAllProducts(filters);
    const products = result.data?.body;
    const dataItems = [];

    if (products?.length) {
      for (let i = 0; i < products.length; i++) {
        dataItems.push({
          key: (i + 1).toString(),
          type: products[i].product_type,
          name: products[i].product_name,
          volume: products[i].volume,
          weight: products[i].weight,
          product_id: products[i].product_id,
          'expiry-duration': products[i].expiry_duration,
          description: products[i].description,
          is_stackable: products[i].is_stackable,
          price: products[i].price
        });
      }

      setDataSource(dataItems);
    } else {
      setDataSource([]);
    }
  }


  const debouncedSearch = debounce(async (filters) => {
    await getAllProducts(filters);
  }, 1000);

  const handleAddItemSuccess = async () => {
    await getAllProducts(filters);
  }

  const handleEditItemSuccess = async () => {
    await getAllProducts(filters);
  }

  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      type: '',
      name: '',
      volume: '',
      weight: '',
      'expiry-duration': '',
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
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: 'Volume (m^3)',
      dataIndex: 'volume',
      key: 'volume',
      align: 'center',
    },
    {
      title: 'Weight (kg)',
      dataIndex: 'weight',
      key: 'weight',
      align: 'center',
    },
    {
      title: 'Expiry duration (days)',
      dataIndex: 'expiry-duration',
      key: 'expiry-duration',
      align: 'center',
    },
  ];

  const items = [
    {
      label: '<=',
    },
    {
      label: '>=',
    },
  ];

  const menuVolumeProps = {
    items,
    onClick: handleVolumeClick,
  };

  const menuWeightProps = {
    items,
    onClick: handleWeightClick,
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

    productApi.getAllProducts(filters).then((result) =>{
      const products = result.data?.body;
      const dataItems = [];

      if (products?.length) {
        for (let i = 0; i < products.length; i++) {
          dataItems.push({
            key: (i + 1).toString(),
            type: products[i].product_type,
            name: products[i].product_name,
            volume: products[i].volume,
            weight: products[i].weight,
            'expiry-duration': products[i].expiry_duration,
            product_id: products[i].product_id,
            description: products[i].description,
            is_stackable: products[i].is_stackable,
            price: products[i].price,
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
    <div className="items-container">
      <div className={'items-table-container'}>
        <div className={'items-table-header-container'}>
          <span className={'items-table-header'}>VENDORS</span>
          <div className={'options-container'}>
            <div className="search-bar-container">
              <Dropdown
                menu={menuWeightProps}
                className={'search-bar-dropdown-container'}
              >
                <Button>
                  <Space>
                    {selectWeightValue}
                    {/*<DownOutlined />*/}
                  </Space>
                </Button>
              </Dropdown>
              {/* <Dropdown */}
              {/*   menu={menuProps} */}
              {/*   className={'search-bar-dropdown-container'} */}
              {/* > */}
              {/*   <Button> */}
              {/*     <Space> */}
              {/*       {selected} */}
              {/*       <DownOutlined /> */}
              {/*     </Space> */}
              {/*   </Button> */}
              {/* </Dropdown> */}
              <div className="filter">
                <label className="labels" htmlFor="weight">Weight</label>
                <input
                  type=""
                  className="search-bar-filter"
                  id="weight"
                  onChange={handleWeightInputChange}
                />
              </div>

              <Dropdown
                menu={menuVolumeProps}
                className={'search-bar-dropdown-container'}
              >
                <Button>
                  <Space>
                    {selectVolumeValue}
                    {/*<DownOutlined />*/}
                  </Space>
                </Button>
              </Dropdown>
              <div className="filter">
                <label className="labels" htmlFor="volume">Volume</label>
                <input
                  type=""
                  className="search-bar-filter"
                  id="volume"
                  onChange={handleVolumeInputChange}
                />
              </div>
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
            <AddItem
              hidePopup={hideAddPopup}
              isPopupVisible={isPopupVisible}
              itemData={{ newItemData, setNewItemData }}
              onAddItemSuccess={handleAddItemSuccess}
            />
            <EditItem
              hidePopup={hideEditPopup}
              isEditPopupVisible={isEditPopupVisible}
              itemData={{ editItemData: newItemData, setEditItemData: setNewItemData }}
              onEditItemSuccess={handleEditItemSuccess}
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
