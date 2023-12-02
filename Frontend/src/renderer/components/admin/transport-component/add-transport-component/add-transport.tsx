import React from 'react';
import './add-transport.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { userApi } from '../../../../index';

export interface INewTransportData {
  TransportID?: string;
  Capacity?: string;
  'Max Speed'?: string;
  Type?: string;
  Price_weight?: string;
}

export default function AdminAddTransport({
  isPopupVisible,
  hidePopup,
  warehouseData,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  warehouseData: {
    transportData: INewTransportData;
    setTransportData: (userData: unknown) => void;
  };
}) {
  const formRef = React.useRef<FormInstance>(null);

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 13, span: 17 },
  };

  function onRoleChange() {
    console.log('change');
  }

  const onCancel = () => {
    hidePopup();
    handleReset();
  };

  const onFinish = async () => {
    const newTransportData = formRef.current?.getFieldsValue();
    let check = false;
    for (let key in newTransportData) {
      if (newTransportData[key]) {
        check = true;
      }
    }
    if (!check) {
      hidePopup();
      handleReset();
    } else {
      hidePopup();
    }
    // await userApi.addUser({
    //   user_name: newUserData['First Name'],
    //   user_surname: newUserData['Last Name'],
    //   user_email: newUserData['Email'],
    //   user_phone: newUserData['Phone'],
    //   user_role: newUserData['Role'],
    // });

    warehouseData.setTransportData(newTransportData);
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };
  return (
    <Modal
      title={<p style={{ fontSize: '1.2vw' }}>Add New Warehouse</p>}
      width={'30vw'}
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
        name="add-user"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="TransportID"
          label={<p style={{ fontSize: '1vw' }}>Transport ID</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Capacity"
          label={<p style={{ fontSize: '1vw' }}>Capacity</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Max Speed"
          label={<p style={{ fontSize: '1vw' }}>Max Speed</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Price_weight"
          label={<p style={{ fontSize: '1vw' }}>Price/weight</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Type"
          label={<p style={{ fontSize: '1vw' }}>Type</p>}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={'Select a Type'}
            onChange={onRoleChange}
            style={{ minHeight: '2vw' }}
          >
            <Select.Option value="track">Track</Select.Option>
            <Select.Option value="van">Van</Select.Option>
            <Select.Option value="car">Car</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          {...tailLayout}
          labelAlign={'right'}
          style={{ marginBottom: '1vw' }}
        >
          <Button
            htmlType="button"
            onClick={handleReset}
            style={{ marginRight: '1.3vw' }}
          >
            Reset
          </Button>

          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}