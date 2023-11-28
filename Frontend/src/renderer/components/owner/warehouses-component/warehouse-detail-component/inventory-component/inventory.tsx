import React, { useEffect } from 'react';
import './inventory.scss';
import { Modal, Table } from 'antd';

export default function Inventory({
  isInventoryPopupVisible,
  hidePopup,
  inventoryData,
}: {
  isInventoryPopupVisible: boolean;
  hidePopup: () => void;
  inventoryData: {
    inventoryData: unknown;
    setInventoryData: (inventoryData: unknown) => void;
  };
}) {
  const [scrollSize, setScrollSize] = React.useState({ x: 0, y: 0 });
  const [dataSource, setDataSource] = React.useState([]);

  inventoryData.inventoryData = {
    rack_id: 1,
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

    // warehouseApi.getAllWarehouses({}).then(async (result) => {
    //   const warehouses = result.data?.body;
    //   if (warehouses?.length) {
    //     const allUsers = (await userApi.getAllUsers({})).data.body;
    //     for (let i = 0; i < warehouses.length; i++) {
    //       const user = allUsers?.find(
    //         (user) => (user.user_id = warehouses[i].supervisor),
    //       );
    //       data.push({
    //         key: (i + 1).toString(),
    //         warehouseName: warehouses[i].warehouse_name,
    //         supervisor: user.user_name + ' ' + user.user_surname,
    //         address: warehouses[i].warehouse_address,
    //         type: warehouses[i].warehouse_type,
    //         capacity:
    //           warehouses[i].remaining_capacity +
    //           '/' +
    //           warehouses[i].overall_capacity,
    //         warehouse_id: warehouses[i].warehouse_id,
    //         overall_capacity: warehouses[i].overall_capacity,
    //         remaining_capacity: warehouses[i].remaining_capacity,
    //       });
    //     }
    //     setDataSource(data);
    //   }
    // });

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
      title: 'Total Volume',
      dataIndex: 'totalVolume',
      key: 'totalVolume',
    },
    {
      title: 'Total Count',
      dataIndex: 'totalCount',
      key: 'totalCount',
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
    },
  ];

  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      itemName: 'Ravshanbek',
      totalWeight: '65 kg',
      totalVolume: '60 m3',
      totalCount: '1',
      expiryDate: '12.12.2021',
      itemType: 'Stackable',
    }),
  );

  let tableData = dataSource.length > 0 ? dataSource : placeholderData;
  if (tableData.length < placeholderRowCount) {
    tableData = [...tableData, ...placeholderData.slice(tableData.length + 1)];
  }

  return (
    <Modal
      title={'Inventory of Rack ' + inventoryData.inventoryData['rack_id']}
      open={isInventoryPopupVisible}
      onCancel={hidePopup}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
      width={800}
    >
      <Table
        columns={columns as []}
        dataSource={tableData as []}
        scroll={scrollSize}
        pagination={false}
        size={'small'}
        bordered={true}
      />
    </Modal>
  );
}
