import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Form, Input, Space, Tooltip } from 'antd';
import { useError } from '../result-handler-component/error-component/error-context';
import { useLoading } from '../loading-component/loading';
import './reset-password.scss';
import { useSuccess } from '../result-handler-component/success-component/success-context';

export function ResetPassword() {
  const location = useLocation();
  const [resetEmail, setResetEmail] = useState('');
  const [password, setPassword] = useState('');
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();
  const { state } = location;
  const {
    locLoginEmail,
    locLoginPassword,
    locResetEmail,
    locName,
    locEmail,
    locAddress,
    locFirstName,
    locLastName,
    locUserEmail,
    locPhoneNumber,
    locPassword,
    locRePassword,
    locRole,
    locUserAddress,
  } = state || {};
  const { showError } = useError();
  const { showSuccess } = useSuccess();

  useEffect(() => {
    setResetEmail(locResetEmail || ''); // Use empty string as a fallback
  }, [locResetEmail]);

  const navigateToPath = (path) => {
    navigate(path, {
      state: {
        locLoginEmail: locLoginEmail,
        locLoginPassword: locLoginPassword,
        locName: locName,
        locEmail: locEmail,
        locAddress: locAddress,
        locFirstName: locFirstName,
        locLastName: locLastName,
        locUserEmail: locUserEmail,
        locPhoneNumber: locPhoneNumber,
        locPassword: locPassword,
        locRePassword: locRePassword,
        locRole: locRole,
        locUserAddress: locUserAddress,
        locResetEmail: resetEmail,
      },
    });
  };

  return (
    <div className="sign-in-container">
      <header>WAREHOUSE MANAGEMENT SYSTEM</header>
      <div className="content">
        <div className="login-form">
          <div className="tabs-container">
            <div className="tabs-left">
              <span id="sign-in">RESET PASSWORD</span>
            </div>
            <div className="tabs-right">
              <span
                id="login"
                className="disabled"
                onClick={() => {
                  navigateToPath('/sign-in');
                }}
              >
                Login
              </span>
              <span
                className="disabled"
                id="sign-up"
                onClick={() => {
                  navigateToPath('/sign-up');
                }}
              >
                Sign Up
              </span>
            </div>
          </div>
          <Form
            onFinish={() => {
              navigateToPath('/sign-in');
              showSuccess(
                'Please wait. System Administrator will reset password soon.',
              );
            }}
          >
            <Form.Item
              label={<p style={{ fontSize: '1vw' }}>Your Email</p>}
              name="Email"
              rules={[{ required: true }]}
              wrapperCol={{ span: 20, offset: 1 }}
            >
              <Input
                type="email"
                placeholder={'Email'}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label={
                <p style={{ fontSize: '1vw' }}>
                  Are you sure that you want to reset your password?
                </p>
              }
              className={'reset-password-form-button'}
              wrapperCol={{ span: 20, offset: 1 }}
            >
              <Space direction={'horizontal'} size={25}>
                <Button
                  type="primary"
                  // onClick={async () => handleSignIn()}
                  style={{
                    width: '5vw',
                    margin: '0',
                  }}
                  htmlType="submit"
                >
                  Yes
                </Button>
                <Button
                  type="primary"
                  danger={}
                  style={{
                    width: '5vw',
                    margin: '0',
                  }}
                >
                  No
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
