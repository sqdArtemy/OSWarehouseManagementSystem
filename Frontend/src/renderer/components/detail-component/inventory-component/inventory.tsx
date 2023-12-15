import React, { useEffect, useState } from 'react';
import './inventory.scss';
import { Button, InputNumber, Modal, Select, Space, Table } from 'antd';
import {
  inventoryApi,
  productApi,
  rackApi,
  userApi,
  warehouseApi,
} from '../../../index';
import { useError } from '../../error-component/error-context';
import EditRack from '../edit-rack-component/edit-rack';
import { IProductFilters } from '../../../services/interfaces/productsInterface';
import { normalizeRacksForGrid } from '../../../services/utils/normalizeRacksForGrid';

export default function Inventory({
  isInventoryPopupVisible,
  hidePopup,
  rackData,
  inventoryData,
  updateChartData,
  updateGridData,
}: {
  isInventoryPopupVisible: boolean;
  hidePopup: () => void;
  rackData: {
    rackData: unknown;
    setRackData: (RackData: unknown) => void;
  };
  inventoryData: {
    inventoryData: unknown;
    setInventoryData: (InventoryData: unknown) => void;
  };
  updateChartData: () => void;
  updateGridData: (data: any) => void;
}) {
  const [scrollSize, setScrollSize] = React.useState({ x: 0, y: 0 });
  const { showError } = useError();
  const [isEditRackPopupVisible, setIsEditRackPopupVisible] = useState(false);
  const [gridData, setGridData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    { productName: string; totalCount: number }[]
  >([]);
  const [products, setProducts] = useState<Select['OptionType'][]>([]);
  let originalInventory = [];

  const getProducts = async (filters: IProductFilters) => {
    const rackId = rackData.rackData.rack_id;

    const rackResponse = await rackApi.getRack(rackId);
    if (rackResponse.success) {
      const warehouse = await warehouseApi.getWarehouse(
        rackResponse.data.body.warehouse,
      );

      if (warehouse.success) {
        filters.product_type = warehouse.data.data.warehouse_type;
      }
    }

    const products = await productApi.getAllProducts(filters);
    const mapToOptions = (data) => {
      return data.map((item) => ({
        value: item.product_id,
        label: item.product_name,
        volume: item.volume,
        weight: item.weight,
        price: item.price,
      }));
    };

    setProducts(mapToOptions(products.data.body));
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
        x: vw * 0.5,
        y: vh * 0.3,
      });
    };

    calculateScrollSize();
    window.addEventListener('resize', calculateScrollSize);

    originalInventory = JSON.parse(JSON.stringify(inventoryData.inventoryData));
    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Type',
      dataIndex: 'itemType',
      key: 'itemType',
    },
    {
      title: 'Total Weight',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
    },
    {
      title: 'Total Volume m³',
      dataIndex: 'totalVolume',
      key: 'totalVolume',
    },
    {
      title: 'Total Count',
      dataIndex: 'totalCount',
      key: 'totalCount',
      render: (_, record) =>
        isEditMode ? (
          <InputNumber
            style={{ fontSize: '0.9vw' }}
            value={record.totalCount}
            onChange={(value) => handleUpdateTotalCount(record.itemName, value)}
          />
        ) : (
          record.totalCount
        ),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
    },
    isEditMode && {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          danger
          onClick={() => handleRemoveProduct(record.itemName)}
          style={{ fontSize: '0.9vw' }}
        >
          Delete
        </Button>
      ),
    },
  ].filter(Boolean);

  let tableData =
    inventoryData.inventoryData.length > 0 ? inventoryData.inventoryData : [];

  const handleDeleteRack = async () => {
    console.log(rackData);
    const response = await rackApi.deleteRack(
      rackData.rackData['rack_id'] as number,
    );
    console.log(response);
    if (response.success) {
      hidePopup();
    } else {
      showError(response.message);
    }

    const warehouse = await warehouseApi.getWarehouse(
      Number(warehouseApi.warehouseData.warehouse_id),
    );
    if (warehouse.success && warehouse.data?.data) {
      updateGridData(normalizeRacksForGrid(warehouse.data.data.racks));
    }
  };

  const hideEditRackPopup = () => {
    setIsEditRackPopupVisible(false);
  };

  const showEditRackPopup = () => {
    setIsEditRackPopupVisible(true);
  };

  const addInventoryItem = async (rackId, productId, quantity) => {
    const response = await inventoryApi.addInventory({
      rack_id: rackId,
      product_id: productId,
      quantity: quantity,
    });

    if (!response.success) {
      showError(response.message);
    }
  };

  const deleteInventoryItem = async (rackId, productId, quantity) => {
    const response = await inventoryApi.deleteInventory({
      rack_id: rackId,
      product_id: productId,
      quantity: quantity,
    });

    if (!response.success) {
      showError(response.message);
    }
  };

  const updateInventoryItem = async (
    rackId,
    productId,
    currentQuantity,
    newQuantity,
  ) => {
    if (newQuantity > currentQuantity) {
      await addInventoryItem(rackId, productId, newQuantity - currentQuantity);
    } else if (newQuantity < currentQuantity) {
      await deleteInventoryItem(
        rackId,
        productId,
        currentQuantity - newQuantity,
      );
    }
  };

  const handleUpdateInventory = async () => {
    setIsEditMode(false);

    const updatedInventoryData = inventoryData.inventoryData.map((item) => {
      const selectedItem = selectedProducts.find(
        (selectedItem) => selectedItem.productName === item.itemName,
      );

      if (selectedItem) {
        return { ...item, totalCount: selectedItem.totalCount };
      }

      return item;
    });

    const currentInventory = inventoryData.inventoryData;
    const apiResponse = await rackApi.getRack(rackData.rackData.rack_id);

    if (apiResponse.success) {
      const originalInventory = apiResponse.data.body.inventories;

      for (let inventory of currentInventory) {
        const product = products.find(
          (product) => product.label === inventory.itemName,
        );
        const inventoryItem = originalInventory.find(
          (orgInventory) => product.value === orgInventory.product,
        );

        if (!inventoryItem) {
          await addInventoryItem(
            rackData.rackData.rack_id,
            product.value,
            inventory.totalCount,
          );
        } else {
          await updateInventoryItem(
            rackData.rackData.rack_id,
            product.value,
            inventoryItem.quantity,
            inventory.totalCount,
          );
        }
      }

      for (let item of originalInventory) {
        const product = products.find(
          (product) => product.value === item.product,
        );
        const inventoryItem = currentInventory.find(
          (currInventory) => product.label === currInventory.itemName,
        );

        if (!inventoryItem) {
          await deleteInventoryItem(
            rackData.rackData.rack_id,
            product.value,
            item.quantity,
          );
        }
      }

      inventoryData.setInventoryData(updatedInventoryData);
      setSelectedProducts([]);
      updateChartData();

      const warehouse = await warehouseApi.getWarehouse(
        Number(warehouseApi.warehouseData.warehouse_id),
      );
      if (warehouse.success && warehouse.data?.data) {
        updateGridData(normalizeRacksForGrid(warehouse.data.data.racks));
      }
    }
  };

  const handleUpdateTotalCount = (productName, value) => {
    const updatedTableData = tableData.map((item) =>
      item.itemName === productName ? { ...item, totalCount: value } : item,
    );
    inventoryData.setInventoryData(updatedTableData);

    // Update the selectedProducts array with the new totalCount value
    const updatedSelectedProducts = selectedProducts.map((item) =>
      item.productName === productName ? { ...item, totalCount: value } : item,
    );
    setSelectedProducts(updatedSelectedProducts);
  };

  const handleSearchProducts = (value) => {
    // Check if the product with the same itemName already exists in tableData
    const existingProduct = tableData.find((item) => item.itemName === value);

    if (existingProduct) {
      // Product already exists, update its totalCount
      const updatedTableData = tableData.map((item) =>
        item.itemName === value
          ? { ...item, totalCount: item.totalCount + 1 }
          : item,
      );
      inventoryData.setInventoryData(updatedTableData);

      if (isEditMode) {
        const updatedSelectedProducts = selectedProducts.map((item) =>
          item.productName === value
            ? { ...item, totalCount: item.totalCount + 1 }
            : item,
        );
        setSelectedProducts(updatedSelectedProducts);
      }
    } else {
      const newProduct = {
        itemName: value,
        itemType: '', // Set the appropriate value based on your requirements
        totalWeight: '', // Set the initial values as needed
        totalVolume: '',
        totalCount: 1,
        expiryDate: '', // Set the initial values as needed
      };

      const updatedTableData = [...tableData, newProduct];
      inventoryData.setInventoryData(updatedTableData);

      if (isEditMode) {
        setSelectedProducts([
          ...selectedProducts,
          { productName: value, totalCount: 1 },
        ]);
      }
    }
  };

  const handleRemoveProduct = (productName) => {
    const updatedTableData = tableData.filter(
      (item) => item.itemName !== productName,
    );
    inventoryData.setInventoryData(updatedTableData);

    if (isEditMode) {
      const updatedSelectedProducts = selectedProducts.filter((item) => {
        console.log(item);
        return item.productName !== productName;
      });
      setSelectedProducts(updatedSelectedProducts);
    }
  };

  const handleToggleEditMode = async () => {
    setIsEditMode(!isEditMode);
    await getProducts({});
  };

  return (
    <Modal
      title={'Inventory of Rack ' + rackData.rackData['position']}
      open={isInventoryPopupVisible}
      onCancel={hidePopup}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
      width={'60vw'}
    >
      <Space direction="vertical" size="middle">
        {isEditMode && (
          <>
            {/* Add a button to handle updating the inventory */}
            {/* Add a search input for products */}
            <Select
              showSearch
              style={{ width: 200, minHeight: '2vw' }}
              placeholder="Search for products"
              optionFilterProp="label"
              onSelect={handleSearchProducts}
            >
              {products.map((product) => (
                <Select.Option key={product.value} value={product.label}>
                  {product.label}
                </Select.Option>
              ))}
            </Select>
            <Button
              style={{
                fontSize: '0.9vw',
                width: '8vw',
                height: '2.1vw',
              }}
              type={'primary'}
              onClick={handleUpdateInventory}
            >
              {isEditMode ? 'Save Changes' : 'Update Inventory'}
            </Button>
          </>
        )}
        <Table
          columns={columns as []}
          dataSource={tableData as []}
          scroll={scrollSize}
          pagination={false}
          size={'small'}
          bordered={true}
        />
        <Space
          direction="horizontal"
          size="middle"
          className={'generalized-detail-footer-btns'}
        >
          {userApi.getUserData.user_role === 'supervisor' && (
            <>
              {isEditMode ? null : (
                <>
                  <Button type={'primary'} onClick={showEditRackPopup}>
                    Edit Rack
                  </Button>
                  <Button danger onClick={handleDeleteRack}>
                    Delete Rack
                  </Button>
                </>
              )}
              <Button
                danger={isEditMode}
                type="primary"
                onClick={handleToggleEditMode}
                style={{ width: '15vw' }}
              >
                {isEditMode ? 'Cancel Update' : 'Update Inventory'}
              </Button>
            </>
          )}
        </Space>
        <EditRack
          isPopupVisible={isEditRackPopupVisible}
          hidePopup={hideEditRackPopup}
          rackData={{
            rackData: rackData.rackData,
            setRackData: rackData.setRackData,
          }}
          updateGridData={updateGridData}
        ></EditRack>
      </Space>
    </Modal>
  );
}
