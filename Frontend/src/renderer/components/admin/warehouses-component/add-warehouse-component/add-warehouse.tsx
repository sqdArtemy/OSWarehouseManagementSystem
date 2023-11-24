import React from 'react';
import './add-warehouse.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { userApi } from '../../../../index';

export interface INewWarehouseData {
  'Warehouse Name'?: string;
  Capacity?: string;
  Address?: string;
  Type?: string;
  Supervisor?: string;
}

export default function AdminAddWarehouse({
  isPopupVisible,
  hidePopup,
  warehouseData,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  warehouseData: {
    warehouseData: INewWarehouseData;
    setWarehouseData: (userData: unknown) => void;
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
    const newWarehouseData = formRef.current?.getFieldsValue();
    let check = false;
    for (let key in newWarehouseData) {
      if (newWarehouseData[key]) {
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

    warehouseData.setWarehouseData(newWarehouseData);
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
          name="Warehouse Name"
          label={<p style={{ fontSize: '1vw' }}>Name</p>}
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
          name="Address"
          label={<p style={{ fontSize: '1vw' }}>Address</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Supervisor"
          label={<p style={{ fontSize: '1vw' }}>Supervisor</p>}
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
            <Select.Option value="manager">Freezer</Select.Option>
            <Select.Option value="shipper">Refrigerator</Select.Option>
            <Select.Option value="manager">Dry</Select.Option>
            <Select.Option value="shipper">Hazardous</Select.Option>
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
