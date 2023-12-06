import React, { useEffect, useState } from 'react';
import { IOrderData } from '../requests';
import { Button, Form, Input, Modal, Table } from 'antd';
import RacksGrid from '../../../racks-grid-component/racks-grid';
import { orderApi, userApi, warehouseApi } from '../../../../index';
import { normalizeRacksForGrid } from '../../../../services/utils/normalizeRacksForGrid';
import { normalizePreviewedRacks } from '../../../../services/utils/normalizePreviewedRacks';
import { useLoading } from '../../../loading-component/loading';
import { useError } from '../../../error-component/error-context';
import { useNavigate } from 'react-router-dom';
import './preview.scss';
import { getItems, getLostItems } from '../util';

export default function Preview({
  isPopupVisible,
  hidePopup,
  orderData,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  orderData: {
    orderData: IOrderData;
    setOrderData: (orderData: IOrderData) => void;
  };
}) {
  const [previewGridData, setPreviewGridData] = useState([]);
  const [filledInventories, setFilledInventories] = useState([]);
  const [itemsDataSource, setItemsDataSource] = useState([]);
  const [lostItemsDataSource, setLostItemsDataSource] = useState([]);
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const { showError } = useError();
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (orderData.orderData && isPopupVisible) {
        startLoading();
        try {
          const warehouseResponse = await warehouseApi.getWarehouse(
            Number(orderData.orderData.warehouseId),
          );
          if (warehouseResponse.success && warehouseResponse.data?.data) {
            const normalizedData = normalizeRacksForGrid(
              warehouseResponse.data.data.racks,
            );

            let previewResponse;
            if(orderData.orderData.orderStatus === 'to_warehouse') {
              previewResponse = await orderApi.receiveOrderPreview(
                orderData.orderData.orderId,
              );
            } else {
              previewResponse = await orderApi.sendOrderPreview(
                orderData.orderData.orderId,
              );
            }
            if (previewResponse.success) {
              setFilledInventories(
                previewResponse.data.body.filled_inventories,
              );
              setPreviewGridData(
                normalizePreviewedRacks(
                  normalizedData,
                  previewResponse.data.body.filled_inventories,
                ),
              );
            } else {
              showError(previewResponse.message);
            }
          } else {
            showError(warehouseResponse.message);
          }
          const itemsResponse = await getItems(orderData);
          const lostItemsResponse = await getLostItems(orderData);
          setItemsDataSource(itemsResponse);
          setLostItemsDataSource(lostItemsResponse);
        } catch (error) {
          showError(error.message);
        } finally {
          stopLoading();
        }
      }
    };

    fetchData();
  }, [isPopupVisible]);

  const onFinish = async () => {
    startLoading();
    console.log(orderData.orderData);
    let result;

    if(orderData.orderData.orderStatus === 'to_warehouse') {
      result = await orderApi.receiveOrder(
        orderData.orderData.orderId,
        filledInventories,
      );
    } else {
      result = await orderApi.sendOrder(
        orderData.orderData.orderId,
        filledInventories
      );
    }

    stopLoading();
    if (result.success) {
      hidePopup();
      return navigate(
        `/supervisor/warehouses/${orderData.orderData.warehouseId}`,
        {
          state: {
            locWarehouseData: {
              warehouse_id: orderData.orderData.warehouseId,
              warehouseName: userApi.getUserData.warehouses[0].warehouse_name,
              capacity: userApi.getUserData.warehouses[0].overall_capacity,
              supervisor:
                userApi.getUserData.warehouses[0].supervisor.user_name,
              type: userApi.getUserData.warehouses[0].warehouse_type,
              address: userApi.getUserData.warehouses[0].warehouse_address,
              remaining: userApi.getUserData.warehouses[0].remaining_capacity,
            },
          },
        },
      );
    } else {
      hidePopup();
      showError(result.message);
    }
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
        x: vw * 0.1,
        y: vh * 0.2,
      });
    };
    calculateScrollSize();
    window.addEventListener('resize', calculateScrollSize);

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
    },
  ];

  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      name: '',
      amount: '',
    }),
  );

  let itemsTableData =
    itemsDataSource.length > 0 ? itemsDataSource : placeholderData;
  if (itemsTableData.length < placeholderRowCount) {
    itemsTableData = [
      ...itemsTableData,
      ...placeholderData.slice(itemsTableData.length + 1),
    ];
  }

  let lostItemsTableData =
    lostItemsDataSource.length > 0 ? lostItemsDataSource : placeholderData;
  if (lostItemsTableData.length < placeholderRowCount) {
    lostItemsTableData = [
      ...lostItemsTableData,
      ...placeholderData.slice(lostItemsTableData.length + 1),
    ];
  }

  return (
    <Modal
      open={isPopupVisible}
      onCancel={hidePopup}
      onOk={onFinish}
      footer={null}
      width="80vw"
      title="Order Preview"
      okButtonProps={{ style: { display: 'none' } }}
    >
      <Form onFinish={onFinish}>
        <div className={'order-preview-container'}>
          <div className={'order-preview-left-container'}>
            <RacksGrid externalGridData={previewGridData} />
            <Button type="primary" htmlType="submit">
              Confirm
            </Button>
          </div>
          <div className={'order-preview-right-container'}>
            <div className={'order-preview-right-items-list-container'}>
              <span className={'order-preview-right-table-header'}>
                Items List
              </span>
              <Table
                dataSource={itemsTableData as []}
                columns={columns as []}
                scroll={scrollSize}
                pagination={false}
                size={'small'}
                bordered={true}
                className={'order-preview-right-items-table'}
                rowClassName={'default-table-row-height'}
              />
            </div>
            <div className={'order-preview-right-lost-items-list-container'}>
              <span className={'order-preview-right-table-header'}>
                Lost Items List
              </span>
              <Table
                dataSource={lostItemsTableData as []}
                columns={columns as []}
                scroll={scrollSize}
                pagination={false}
                size={'small'}
                bordered={true}
                className={'order-preview-right-items-table'}
                rowClassName={'default-table-row-height'}
              />
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
}
