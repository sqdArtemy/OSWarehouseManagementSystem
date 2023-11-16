import React from 'react';
import './add-user.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { userApi } from '../../../../index';

export interface IUserData {
  'First Name'?: string;
  'Last Name'?: string;
  Email?: string;
  Phone?: string;
  Role?: string;
}

export default function AddUser({
  isPopupVisible,
  hidePopup,
  userData,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  userData: {
    newUserData: IUserData;
    setNewUserData: (newUserData: unknown) => void;
  };
}) {
  const formRef = React.useRef<FormInstance>(null);

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 16, span: 17 },
  };

  function onRoleChange() {
    console.log('change');
  }

  const onFinish = async () => {
    const newUserData = formRef.current?.getFieldsValue();
    let check = false;
    for (let key in newUserData) {
      if (newUserData[key]) {
        check = true;
      }
    }
    if (!check) {
      hidePopup();
      handleReset();
    } else {
      hidePopup();
    }
    await userApi.addUser({
      user_name: newUserData['First Name'],
      user_surname: newUserData['Last Name'],
      user_email: newUserData['Email'],
      user_phone: newUserData['Phone'],
      user_role: newUserData['Role']
    });

    userData.setNewUserData(newUserData);
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };
  return (
    <Modal
      title="Add New User"
      open={isPopupVisible}
      onOk={onFinish}
      onCancel={onFinish}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
    >
      <Form
        {...layout}
        labelAlign={'left'}
        ref={formRef}
        name="control-ref"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="First Name"
          label="First Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="Last Name"
          label="Last Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="Email" label="Email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="Phone" label="Phone" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="Role" label="Role" rules={[{ required: true }]}>
          <Select
            placeholder="Select a role"
            onChange={onRoleChange}
            allowClear
          >
            <Option value="manager">Manager</Option>
            <Option value="shipper">Shipper</Option>
          </Select>
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button
            htmlType="button"
            onClick={handleReset}
            style={{ marginRight: '1vw' }}
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
