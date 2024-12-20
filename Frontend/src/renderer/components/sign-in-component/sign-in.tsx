import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userApi } from '../../index';
import './sign-in.scss';
import { Button, Form, Input, Space, Tooltip } from 'antd';
import { useError } from '../result-handler-component/error-component/error-context';
import { useLoading } from '../loading-component/loading';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

export function SignIn() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();
  const { state } = location;
  const {
    locLoginEmail,
    locLoginPassword,
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
    locResetEmail,
  } = state || {};
  const { showError } = useError();
  const handleSignIn = async () => {
    console.log('email', email);
    console.log('password', password);
    if (!email && !password) {
      showError('Please input email and password');
      return;
    } else if (!email) {
      showError('Please input email');
      return;
    } else if (!password) {
      showError('Please input password');
      return;
    }
    startLoading();
    const response = await userApi.signIn(email, password);
    console.log('response', response);
    if (response.success) {
      stopLoading();
      switch (response.data?.user_role) {
        case 'manager':
          navigate('/owner');
          break;
        case 'vendor':
          stopLoading();
          navigate('/vendor');
          break;
        case 'supervisor':
          stopLoading();
          navigate('/supervisor');
          break;
        case 'admin':
          stopLoading();
          navigate('/admin');
          break;
        default:
          break;
      }
    } else {
      stopLoading();
      showError(response.message);
      // some error message
    }
  };

  useEffect(() => {
    setEmail(locLoginEmail || ''); // Use empty string as a fallback
    setPassword(locLoginPassword || ''); // Use empty string as a fallback
  }, [locLoginEmail, locLoginPassword]);

  return (
    <div className="sign-in-container">
      <header>WAREHOUSE MANAGEMENT SYSTEM</header>
      <div className="content">
        <div className="login-form">
          <div className="tabs-container">
            <div className="tabs-left">
              <span id="sign-in">Sign In</span>
            </div>
            <div className="tabs-right">
              <span id="login">Login</span>
              <span
                className="disabled"
                id="sign-up"
                onClick={() => {
                  navigate('/sign-up', {
                    state: {
                      locLoginEmail: email,
                      locLoginPassword: password,
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
                      locResetEmail: locResetEmail,
                    },
                  });
                }}
              >
                Sign Up
              </span>
            </div>
          </div>
          <Form>
            <Form.Item>
              <Tooltip title={'Input Email'} placement={'topLeft'}>
                <Input
                  type="email"
                  placeholder={'Email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Tooltip>
            </Form.Item>
            <Form.Item>
              <Tooltip title={'Input Password'} placement={'topLeft'}>
                <Input.Password
                  placeholder={'Password'}
                  value={password}
                  iconRender={(visible) =>
                    visible ? (
                      <EyeTwoTone style={{ fontSize: '1vw' }} />
                    ) : (
                      <EyeInvisibleOutlined style={{ fontSize: '1vw' }} />
                    )
                  }
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Tooltip>
            </Form.Item>
            <Space direction={'horizontal'} size={75}>
              <Button
                type="primary"
                onClick={async () => handleSignIn()}
                style={{
                  width: '15vw',
                }}
              >
                SIGN IN
              </Button>
              <Button
                type="dashed"
                block
                style={{
                  width: '13vw',
                }}
                onClick={() => {
                  navigate('/reset-password', {
                    state: {
                      locLoginEmail: email,
                      locLoginPassword: password,
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
                      locResetEmail: locResetEmail,
                    },
                  });
                }}
              >
                Forgot Password
              </Button>
            </Space>
          </Form>
        </div>
      </div>
    </div>
  );
}
