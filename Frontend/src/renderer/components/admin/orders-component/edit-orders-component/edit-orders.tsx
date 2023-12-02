import React, { useEffect } from 'react';
import './edit-orders.scss';
import { Button, Form, FormInstance, Input, Modal } from 'antd';
import { userApi } from '../../../../index';
import { IOrderData } from '../orders';

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

  useEffect(() => {
    if (isPopupVisible && orderData.ordersData && formRef.current) {
      const { fromWarehouse, toWarehouse, amount, price,created_at,transport_type, status } =
        orderData.ordersData;

      formRef.current.setFieldsValue({
        fromWarehouse: fromWarehouse,
        toWarehouse: toWarehouse,
        amount: amount,
        price: price,
        created_at: created_at,
        transport_type: transport_type,
        status: status,
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

    // await userApi.addUser({
    //   user_name: newUserData['First Name'],
    //   user_surname: newUserData['Last Name'],
    //   user_email: newUserData['Email'],
    //   user_phone: newUserData['Phone'],
    //   user_role: newUserData['Role'],
    // });

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
          name="fromWarehouse"
          label={<p style={{ fontSize: '1vw' }}>From </p>}

        >
          <Input disabled={true} style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="toWarehouse"
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
          label={<p style={{ fontSize: '1vw' }}>Price </p>}

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
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
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
