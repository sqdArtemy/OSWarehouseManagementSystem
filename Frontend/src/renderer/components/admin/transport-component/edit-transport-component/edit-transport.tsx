import React, { useEffect } from 'react';
import './edit-transport.scss';
import { Button, Form, FormInstance, Input, Modal } from 'antd';
import { userApi } from '../../../../index';
import { INewWarehouseData } from '../add-warehouse-component/add-warehouse';
import { IWarehouseData } from '../warehouses';

export default function EditWarehouse({
  isPopupVisible,
  hidePopup,
  warehouseData,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  warehouseData: {
    warehouseData: INewWarehouseData | IWarehouseData;
    setWarehouseData: (warehouseData: unknown) => void;
  };
}) {
  console.log(warehouseData.warehouseData);
  const formRef = React.useRef<FormInstance>(null);

  useEffect(() => {
    if (isPopupVisible && warehouseData.warehouseData && formRef.current) {
      const { warehouseName, capacity, supervisor, type, address } =
        warehouseData.warehouseData;
      // const [firstName, lastName] = warehouseName.split(' ');

      formRef.current.setFieldsValue({
        'Warehouse Name': warehouseName,
        Type: type,
        Supervisor: supervisor,
        Capacity: capacity,
        Address: address,
      });
    }
  }, [warehouseData]);

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
    const newWarehouseData = formRef.current?.getFieldsValue();
    hidePopup();

    // await userApi.addUser({
    //   user_name: newUserData['First Name'],
    //   user_surname: newUserData['Last Name'],
    //   user_email: newUserData['Email'],
    //   user_phone: newUserData['Phone'],
    //   user_role: newUserData['Role'],
    // });

    warehouseData.setWarehouseData(newWarehouseData);
  };

  return (
    <Modal
      title={<p style={{ fontSize: '1.2vw' }}>Edit User</p>}
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
        name="edit-user"
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
          <Input disabled={true} style={{ fontSize: '0.9vw' }} />
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
