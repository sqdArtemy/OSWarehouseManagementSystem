import React, { useEffect, useState } from 'react';
import './edit-user.scss';
import { Button, Form, FormInstance, Input, Modal, Space } from 'antd';
import { userApi } from '../../../../index';
import { INewUserData } from '../add-user-component/add-user';
import { IUserData } from '../users';
import { useError } from '../../../result-handler-component/error-component/error-context';
import { useSuccess } from '../../../result-handler-component/success-component/success-context';

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
  const { showError } = useError();
  const { showSuccess } = useSuccess();
  const formRef = React.useRef<FormInstance>(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  useEffect(() => {
    if (isPopupVisible && userData.userData && formRef.current) {
      console.log(userData);
      const { fullName, email, phoneNumber, role, address } = userData.userData;
      const [firstName, lastName] = fullName.split(' ');

      formRef.current.setFieldsValue({
        'First Name': firstName,
        'Last Name': lastName,
        Email: email,
        Phone: phoneNumber,
        Role: role,
        Address: address,
      });
    }
  }, [userData]);

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 13, span: 10 },
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  const onCancel = () => {
    hidePopup();
    handleReset();
  };

  const onFinish = async () => {
    const newUserData = formRef.current?.getFieldsValue();
    hidePopup();

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

    console.log(response);
    if (response?.success) {
      onEditUserSuccess();
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
          name="Role"
          label={<p style={{ fontSize: '1vw' }}>Role</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} disabled={} />
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
          <Space size={10}>
            {userData.userData.isPasswordForgotten !== null &&
            userData.userData.isPasswordForgotten !== 0 ? (
              <Button
                type={'dashed'}
                block
                htmlType={'button'}
                onClick={() => {
                  setIsConfirmModalVisible(true);
                }}
              >
                Reset Password
              </Button>
            ) : (
              <> </>
            )}
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Space>
        </Form.Item>
        <Modal
          open={isConfirmModalVisible}
          title={'Are you sure to reset the password?'}
          onOk={async () => {
            const response = await userApi.resetPasswordToDefault(
              userData.userData.user_id,
            );
            if (!response.success) return showError(response.message);
            showSuccess('Password has been reset to default');
            setIsConfirmModalVisible(false);
          }}
          onCancel={() => {
            setIsConfirmModalVisible(false);
          }}
        ></Modal>
      </Form>
    </Modal>
  );
}
