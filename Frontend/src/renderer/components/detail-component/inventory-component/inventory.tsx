import React, { useEffect } from 'react';
import './inventory.scss';
import { Button, Modal, Space, Table } from 'antd';
import { rackApi, userApi } from '../../../index';
import { useError } from '../../error-component/error-context';

export default function Inventory({
  isInventoryPopupVisible,
  hidePopup,
  rackData,
  inventoryData,
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
}) {
  const [scrollSize, setScrollSize] = React.useState({ x: 0, y: 0 });
  const { showError } = useError();
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
              <Button type={'primary'}>Edit Rack</Button>
              <Button danger onClick={handleDeleteRack}>
                Delete Rack
              </Button>
            </>
          )}
        </Space>
      </Space>
    </Modal>
  );
}
