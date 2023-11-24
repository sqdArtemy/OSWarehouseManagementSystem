import React, { useEffect } from 'react';
import { useState } from 'react';
import './profile.scss';
import { Button, Form, FormInstance, Input, Space } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { userApi } from '../../../index';
import { useError } from '../../error-component/error-context';

export default function Profile() {
  const [changePassDisplay, setChangePassDisplay] = useState(false);
  const [userData, setUserData] = useState({});
  const { showError } = useError();
  let id;

  const formRef = React.useRef<FormInstance>(null);

  const handleChangePass = () => {
    setChangePassDisplay(true);
  };

  const onFinish = async () => {
    const newUserData = formRef.current?.getFieldsValue();
    if(newUserData['Current Password']){
      const response = await userApi.resetPassword(
        newUserData['Current Password'], newUserData['New Password'],newUserData['Confirm Password']);

        if(!response.success) {
            showError(response.message);
        }

    } else {
      const response = await userApi.updateUser({
        user_name: newUserData['First Name'],
        user_surname: newUserData['Last Name'],
        user_email: newUserData['Email']
      }, id);

      if(!response.success) {
        showError(response.message);
      }
    }
    setUserData(newUserData);
  };

  useEffect(() => {
    const data = userApi.getUserData;
    if (data) {
      formRef.current?.setFieldsValue({
        'First Name': data.user_name,
        'Last Name': data.user_surname,
        'Email': data.user_email,
      });

      id = data?.user_id;
    }
  }, []);

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 10 },
  };

  const tailLayout = {
    wrapperCol: { offset: 8, span: 10 },
  };

  const handleReset = () => {
    formRef.current?.resetFields();
    setChangePassDisplay(false);
  };

  return (
    <div className="owner-profile-container">
      <div className="header">
        <span className="header-text">User Info</span>
      </div>
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
          <Input placeholder="First Name" style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Last Name"
          label={<p style={{ fontSize: '1vw' }}>Last Name</p>}
          rules={[{ required: true }]}
        >
          <Input placeholder="Last Name" style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Email"
          label={<p style={{ fontSize: '1vw' }}>Email</p>}
          rules={[{ required: true }]}
        >
          <Input placeholder="Email" style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        {!changePassDisplay ? (
          <></>
        ) : (
          <>
            <Form.Item
              name="Current Password"
              label={<p style={{ fontSize: '1vw' }}>Current Password</p>}
              rules={[{ required: true }]}
            >
              <Input.Password
                placeholder="Current Password"
                style={{ fontSize: '0.9vw' }}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
            <Form.Item
              name="New Password"
              label={<p style={{ fontSize: '1vw' }}>New Password</p>}
              rules={[{ required: true }]}
            >
              <Input.Password
                placeholder="New Password"
                style={{ fontSize: '0.9vw' }}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
            <Form.Item
              name="Confirm Password"
              label={<p style={{ fontSize: '1vw' }}>Confirm Password</p>}
              rules={[{ required: true }]}
            >
              <Input.Password
                placeholder="Confirm Password"
                style={{ fontSize: '0.9vw' }}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
          </>
        )}
        <Form.Item {...tailLayout}>
          <Space direction={'horizontal'} size={150}>
            {!changePassDisplay && (
              <Button
                type="primary"
                htmlType="button"
                onClick={handleChangePass}
              >
                Change Password
              </Button>
            )}
            <Space direction={'horizontal'} size={30}>
              <Button htmlType="button" onClick={handleReset}>
                Reset
              </Button>

              <Button type="primary" htmlType="submit">
                Edit
              </Button>
            </Space>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
