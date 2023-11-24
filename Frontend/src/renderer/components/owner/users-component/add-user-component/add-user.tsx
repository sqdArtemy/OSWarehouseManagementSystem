import React, { useEffect } from 'react';
import './add-user.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { userApi } from '../../../../index';
import { useError } from '../../../error-component/error-context';

export interface INewUserData {
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
  onAddUserSuccess,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  userData: {
    userData: INewUserData;
    setUserData: (userData: unknown) => void;
  };
  onAddUserSuccess: () => void;
}) {
  const formRef = React.useRef<FormInstance>(null);
  const { showError } = useError();

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
    // handleReset();
  };

  const onFinish = async () => {
    const newUserData = formRef.current?.getFieldsValue();
    let check = false;
    for (let key in newUserData) {
      if (newUserData[key]) {
        check = true;
      }
    }

    const response = await userApi.addUser({
      user_name: newUserData['First Name'],
      user_surname: newUserData['Last Name'],
      user_email: newUserData['Email'],
      user_phone: newUserData['Phone'],
      user_role: 'supervisor',
    });

    if (response.success) {
      onAddUserSuccess();
      if (!check) {
        hidePopup();
        handleReset();
      } else {
        hidePopup();
      }
    } else {
      console.log('response', response.message);
      showError(response.message);
    }
    userData.setUserData(newUserData);
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };
  return (
    <Modal
      title={<p style={{ fontSize: '1.2vw' }}>Add New User</p>}
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
          name="First Name"
          label={<p style={{ fontSize: '1vw' }}>First Name</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Last Name"
          label={<p style={{ fontSize: '1vw' }}>Last Name</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Email"
          label={<p style={{ fontSize: '1vw' }}>Email</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Phone"
          label={<p style={{ fontSize: '1vw' }}>Phone</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
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
