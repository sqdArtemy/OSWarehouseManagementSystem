import React, { useEffect } from 'react';
import './edit-user.scss';
import { Button, Form, FormInstance, Input, Modal } from 'antd';
import { userApi } from '../../../../index';
import { INewUserData } from '../add-user-component/add-user';
import { IUserData } from '../users';
import { useError } from '../../../result-handler-component/error-component/error-context';

export default function EditUser({
  isPopupVisible,
  hidePopup,
  userData,
  onEditUserSuccess,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  userData: {
    userData: INewUserData | IUserData;
    setUserData: (userData: unknown) => void;
  };
  onEditUserSuccess: () => void;
}) {
  console.log(userData.userData);
  const formRef = React.useRef<FormInstance>(null);
  const { showError } = useError();
  useEffect(() => {
    if (isPopupVisible && userData.userData && formRef.current) {
      const { fullName, email, phoneNumber, role } = userData.userData;
      const [firstName, lastName] = fullName.split(' ');

      formRef.current.setFieldsValue({
        'First Name': firstName,
        'Last Name': lastName,
        Email: email,
        Phone: phoneNumber,
        Role: role,
      });
    }
  }, [userData]);

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
    // handleReset();
  };

  const onFinish = async () => {
    const newUserData = formRef.current?.getFieldsValue();

    const response = await userApi.updateUser(
      {
        user_name: newUserData['First Name'],
        user_surname: newUserData['Last Name'],
        user_email: newUserData['Email'],
        user_phone: newUserData['Phone'],
        user_role: userData?.userData?.role,
        user_address: newUserData['Address'],
      },
      userData.userData?.user_id,
    );

    if (response?.success) {
      onEditUserSuccess();
      hidePopup();
    } else {
      showError(response.message);
    }
    userData.setUserData(newUserData);
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
          name="Address"
          label={<p style={{ fontSize: '1vw' }}>Address</p>}
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
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
