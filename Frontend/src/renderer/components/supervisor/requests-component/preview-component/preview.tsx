import React, { useEffect, useState } from 'react';
import { IOrderData } from '../requests';
import { Button, Form, Modal } from 'antd';
import RacksGrid from '../../../racks-grid-component/racks-grid';
import { orderApi, userApi, warehouseApi } from '../../../../index';
import { normalizeRacksForGrid } from '../../../../services/utils/normalizeRacksForGrid';
import { normalizePreviewedRacks } from '../../../../services/utils/normalizePreviewedRacks';
import { useLoading } from '../../../loading-component/loading';
import { useError } from '../../../error-component/error-context';
import { useNavigate } from 'react-router-dom';

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

            const previewResponse = await orderApi.receiveOrderPreview(
              orderData.orderData.orderId,
            );
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
    const result = await orderApi.receiveOrder(
      orderData.orderData.orderId,
      filledInventories,
    );
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

  return (
    <Modal
      open={isPopupVisible}
      onCancel={hidePopup}
      onOk={onFinish}
      footer={null}
      width={1000}
      title="Order Preview"
      okButtonProps={{ style: { display: 'none' } }}
    >
      <Form onFinish={onFinish}>
        <Form.Item>
          <RacksGrid externalGridData={previewGridData} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" onClick={onFinish}>
            Confirm
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
