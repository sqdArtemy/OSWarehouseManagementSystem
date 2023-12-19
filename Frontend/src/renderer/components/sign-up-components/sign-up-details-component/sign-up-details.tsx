import React, { useEffect, useState } from 'react';
import './sign-up-details.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { userApi } from '../../../index';
import { Button, Input, Tooltip } from 'antd';
import { useError } from '../../result-handler-component/error-component/error-context';
import { useLoading } from '../../loading-component/loading';

export function SignUpDetails() {
  const location = useLocation();
  const { state } = location;
  const {
    locName: companyName,
    locEmail: companyEmail,
    locAddress: companyAddress,
    locLoginEmail,
    locLoginPassword,
    locRole,
    locResetEmail,
  } = state || {};

  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const { showError } = useError();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    if (state) {
      setUserName(state.locFirstName || '');
      setLastName(state.locLastName || '');
      setUserEmail(state.locUserEmail || '');
      setPhoneNumber(state.locPhoneNumber || '');
      setPassword(state.locPassword || '');
      setRePassword(state.locRePassword || '');
      setUserAddress(state.locUserAddress || '');
    }
  }, [state]);

  const handleSignUp = async () => {
    startLoading();
    const response = await userApi.signUp({
      company_address: companyAddress,
      company_email: companyEmail,
      company_name: companyName,
      user_email: userEmail,
      user_name: userName,
      user_phone: '+' + phoneNumber,
      password,
      confirm_password: rePassword,
      user_surname: lastName,
      user_role: locRole,
      user_address: userAddress,
    });

    if (response.success) {
      stopLoading();
      switch (response.data?.user_role) {
        case 'manager':
          navigate('/owner');
          break;
        case 'vendor':
          navigate('/vendor');
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

  return (
    <div className="sign-up-details-container">
      <header>WAREHOUSE MANAGEMENT SYSTEM</header>
      <div className="content">
        <div className="sign-up-details-form">
          <div className="tabs-container">
            <div className="tabs-left">
              <span id="sign-in">Sign Up</span>
            </div>
            <div className="tabs-right">
              <span
                className="disabled"
                id="login"
                onClick={() => {
                  console.log('locLoginEmail', locLoginEmail);
                  console.log('locLoginPassword', locLoginPassword);
                  navigate('/sign-in', {
                    state: {
                      locLoginEmail: locLoginEmail,
                      locLoginPassword: locLoginPassword,
                      locName: companyName,
                      locEmail: companyEmail,
                      locAddress: companyAddress,
                      locFirstName: userName,
                      locLastName: lastName,
                      locUserEmail: userEmail,
                      locUserAddress: userAddress,
                      locPhoneNumber: phoneNumber,
                      locPassword: password,
                      locRePassword: rePassword,
                      locRole: locRole,
                      locResetEmail: locResetEmail,
                    },
                  });
                }}
              >
                Login
              </span>
              <span id="sign-up">Sign Up</span>
            </div>
          </div>

          <form>
            <Tooltip title={'Input First Name'} placement={'topLeft'}>
              <input
                className={'sign-up-details-field-input'}
                id="name"
                placeholder={'First Name'}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Input Last Name'} placement={'topLeft'}>
              <input
                className={'sign-up-details-field-input'}
                id="userName"
                placeholder={'Last Name'}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Input Email'} placement={'topLeft'}>
              <input
                className={'sign-up-details-field-input'}
                type="Email"
                id="userEmail"
                placeholder={'User Email'}
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Input User Address'} placement={'topLeft'}>
              <input
                className={'sign-up-details-field-input'}
                type="Address"
                id="userAddress"
                placeholder={'User Address'}
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Input Phone Number'} placement={'topLeft'}>
              <Input
                className={'sign-up-details-phone-field-input'}
                addonBefore={'+'}
                placeholder={'Phone Number'}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ fontSize: '1vw' }}
              />
            </Tooltip>
            <Tooltip title={'Input Password'} placement={'topLeft'}>
              <input
                className={'sign-up-details-field-input'}
                type="Password"
                id="password"
                placeholder={'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Confirm Password'} placement={'topLeft'}>
              <input
                className={'sign-up-details-field-input'}
                type="Password"
                id="re-password"
                placeholder={'Confirm Password'}
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
              />
            </Tooltip>

            <span className={'form-btn-container'}>
              <Button
                onClick={() => {
                  console.log('name', companyName);
                  console.log('email', companyEmail);
                  console.log('address', companyAddress);
                  navigate('/sign-up', {
                    state: {
                      locName: companyName,
                      locEmail: companyEmail,
                      locAddress: companyAddress,
                      locFirstName: userName,
                      locLastName: lastName,
                      locUserEmail: userEmail,
                      locPhoneNumber: phoneNumber,
                      locPassword: password,
                      locRePassword: rePassword,
                      locLoginEmail: locLoginEmail,
                      locLoginPassword: locLoginPassword,
                      locRole: locRole,
                      locUserAddress: userAddress,
                    },
                  });
                }}
              >
                Back
              </Button>
              <Button
                type="primary"
                onClick={async () => handleSignUp()}
                className={'sign-up-btn'}
              >
                SIGN UP
              </Button>
            </span>
          </form>
        </div>
      </div>
    </div>
  );
}
