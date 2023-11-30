import React, { useEffect, useState } from 'react';
import { Modal, Form, Table, Button, InputNumber, Space } from 'antd';
import './active-order-detail.scss';
import { orderApi } from '../../../index';
import { useError } from '../../error-component/error-context';

interface ConfirmOrderProps {
  id: string;
  onClose: () => void;
  isActiveOrderVisible: boolean;
}

const ConfirmOrder: React.FC<ConfirmOrderProps> = ({ id, onClose, isActiveOrderVisible, onCancelSuccess }) => {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const { showError } = useError();

  useEffect(() => {
    orderApi.getOrder(Number(id)).then(async (data) => {
      if(data.success) {
        const orderDetails = data.data?.body;


        const vendor = orderDetails.order_type === 'to_warehouse' ? orderDetails.supplier : orderDetails.recipient;
        const warehouse =
          orderDetails.order_type === 'from_warehouse' ? orderDetails.supplier : orderDetails.recipient;

        orderDetails.vendor = vendor?.vendor_name;
        orderDetails.vendor_id = vendor?.vendor_id;
        orderDetails.warehouse = warehouse?.warehouse_name;
        setOrderDetails(data.data?.body);
      } else {
        showError(data.message);
      }
    });
  }, [id]);


  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  return (
    <Modal
      title={`Starting delivery`}
      visible={isActiveOrderVisible}
      onCancel={onClose}
      footer={null}
    >
      <Form {...layout} initialValues={orderDetails} colon={false}>
        <Form.Item label="Vendor Name" name="vendor">
          <span className="form-value">{orderDetails?.vendor}</span>
        </Form.Item>
        <Form.Item label="Warehouse Name" name="warehouse">
          <span className="form-value">{orderDetails?.warehouse}</span>
        </Form.Item>
        <Form.Item label="Total Price" name="total_price">
          <span className="form-value">{orderDetails?.total_price}</span>
        </Form.Item>
        <Form.Item label="Total Volume" name="total_volume">
          <span className="form-value">{orderDetails?.total_volume}</span>
        </Form.Item>
      </Form>

      <Button type="primary" onClick={} style={{ marginTop: '16px' }}>
        Send Order
      </Button>
    </Modal>
  );
};

export default ConfirmOrder;
