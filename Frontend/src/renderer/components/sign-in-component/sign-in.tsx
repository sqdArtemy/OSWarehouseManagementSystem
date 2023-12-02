import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userApi } from '../../index';
import './sign-in.scss';
import { Button, Tooltip } from 'antd';
import { useError } from '../error-component/error-context';
import { useLoading } from '../loading-component/loading';

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
              <span id="id">ID</span>
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
                    },
                  });
                }}
              >
                Sign Up
              </span>
            </div>
          </div>
          <form>
            <Tooltip title={'Input Email'} placement={'topLeft'}>
              <input
                type="email"
                id="email"
                placeholder={'Email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Input Password'} placement={'topLeft'}>
              <input
                type="password"
                id="password"
                placeholder={'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Tooltip>
            <Button type="primary" onClick={async () => handleSignIn()}>
              SIGN IN
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
