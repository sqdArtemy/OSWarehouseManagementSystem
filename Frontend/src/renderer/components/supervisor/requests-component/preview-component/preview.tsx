import React, { useEffect, useState } from 'react';
import { IOrderData } from '../requests';
import { Button, Form, Modal } from 'antd';
import RacksGrid from '../../../racks-grid-component/racks-grid';
import { orderApi, warehouseApi } from '../../../../index';
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
  const [gridData, setGridData] = useState([]);
  const [previewGridData, setPreviewGridData] = useState([]);
  const [filledInventories, setFilledInventories] = useState([]);
  const { showError } = useError();
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    if (orderData.orderData && isPopupVisible) {
      console.log(orderData.orderData);
      startLoading();
      warehouseApi
        .getWarehouse(Number(orderData.orderData.warehouseId))
        .then((data) => {
          console.log(data);
          if (data.success && data.data?.data) {
            setGridData(normalizeRacksForGrid(data.data.data.racks));
          } else {
            showError(data.message);
          }
          stopLoading();
          startLoading();
          orderApi
            .receiveOrderPreview(orderData.orderData.orderId)
            .then((response) => {
              console.log(response);
              if (response.success) {
                setFilledInventories(response.data.body.filled_inventories);
                setPreviewGridData(
                  normalizePreviewedRacks(gridData, filledInventories),
                );
              } else {
                showError(response.message);
              }
              stopLoading();
            });
        });
    }
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
      navigate(`/supervisor/warehouse/${orderData.orderData.warehouseId}`);
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
          <RacksGrid gridData={previewGridData} />
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
