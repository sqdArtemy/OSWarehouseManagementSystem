import React, { useEffect } from 'react';
import './edit-orders.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { orderApi, userApi } from '../../../../index';
import { IOrderData } from '../orders';
import { useError } from '../../../error-component/error-context';

export default function EditOrders({
  isPopupVisible,
  hidePopup,
  orderData,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  orderData: {
    ordersData: IOrderData | any;
    setOrdersData: (orderData: unknown) => void;
  };
}) {
  console.log(orderData.ordersData);
  const formRef = React.useRef<FormInstance>(null);
  const { showError } = useError();

  const order_statuses = [
    {
      label: 'lost',
    },
    {
      label: 'damaged',
    },
    {
      label: 'new',
    },
    {
      label: 'processing',
    },
    {
      label: 'delivered',
    },
    {
      label: 'submitted',
    },
    {
      label: 'finished',
    },
    {
      label: 'cancelled',
    },
  ];

  useEffect(() => {
    if (isPopupVisible && orderData.ordersData && formRef.current) {
      const {
        vendor,
        warehouse,
        amount,
        price,
        created_at,
        transport_type,
        status,
      } = orderData.ordersData;

      formRef.current.setFieldsValue({
        vendor: vendor,
        warehouse: warehouse,
        amount: amount,
        price: price,
        created_at: created_at,
        transport_type: transport_type,
        status: status,
      });

      orderApi.getOrder(orderData.ordersData.order_id).then((data) => {
        if (data.success) {
          const order = data.data.body;

          formRef.current.setFieldsValue({ amount: order.total_volume });
        }
      });
    }
  }, [orderData]);

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 16, span: 17 },
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  const onCancel = () => {
    hidePopup();
    handleReset();
  };

  const onFinish = async () => {
    const newOrderData = formRef.current?.getFieldsValue();
    hidePopup();

    const response = await orderApi.changeStatusOfOrder(
      orderData.ordersData.order_id,
      newOrderData['status'],
    );
    if (!response.success) {
      showError(response.message);
    }

    orderData.setOrdersData(newOrderData);
  };

  return (
    <Modal
      title={<p style={{ fontSize: '1.2vw' }}>Edit Order</p>}
      open={isPopupVisible}
      onOk={onFinish}
      onCancel={onCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
    >
      <Form
        {...layout}
        labelAlign={'left'}
        ref={formRef}
        name="edit-order"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="vendor"
          label={<p style={{ fontSize: '1vw' }}>From </p>}
        >
          <Input disabled={true} style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="warehouse"
          label={<p style={{ fontSize: '1vw' }}>To </p>}
        >
          <Input disabled={true} style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="amount"
          label={<p style={{ fontSize: '1vw' }}>Total Volume </p>}
        >
          <Input disabled={true} style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="price"
          label={<p style={{ fontSize: '1vw' }}>Price $</p>}
        >
          <Input disabled={true} style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="created_at"
          label={<p style={{ fontSize: '1vw' }}>Date </p>}
        >
          <Input disabled={true} style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="transport_type"
          label={<p style={{ fontSize: '1vw' }}>Transport </p>}
        >
          <Input disabled={true} style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="status"
          label={<p style={{ fontSize: '1vw' }}>Status </p>}
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select style={{ fontSize: '0.9vw' }}>
            {order_statuses.map((status) => (
              <Option key={status.label} value={status.label}>
                {status.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
