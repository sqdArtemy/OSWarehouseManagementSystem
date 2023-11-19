import React, { useState } from 'react';
import './sign-up-details.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { userApi } from '../../../index';
import { Tooltip } from 'antd';

export function SignUpDetails() {
  const location = useLocation();
  const { state } = location;
  const {
    name: companyName,
    email: companyEmail,
    address: companyAddress,
  } = state || {};

  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  const handleSignUp = async () => {
    const response = await userApi.signUp({
      company_address: companyAddress,
      company_email: companyEmail,
      company_name: companyName,
      user_email: userEmail,
      user_name: userName,
      user_phone: phoneNumber,
      password,
      confirm_password: rePassword,
      user_surname: lastName,
      user_role: 'manager',
    });

    if (response.success) {
      switch (response.data?.user_role) {
        case 'owner':
          navigate('/owner');
          break;
        default:
          break;
      }
    } else {
      console.log(response.message);
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
              <span id="id">ID</span>
              <span id="sign-in">Sign Up</span>
            </div>
            <div className="tabs-right">
              <span
                className="disabled"
                id="login"
                onClick={() => {
                  navigate('/sign-in');
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
                id="name"
                placeholder={'First Name'}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Input Last Name'} placement={'topLeft'}>
              <input
                id="userName"
                placeholder={'Last Name'}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Input Email'} placement={'topLeft'}>
              <input
                type="Email"
                id="userEmail"
                placeholder={'User Email'}
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Input Phone Number'} placement={'topLeft'}>
              <input
                id="number"
                placeholder={'Phone Number'}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Input Password'} placement={'topLeft'}>
              <input
                type="Password"
                id="password"
                placeholder={'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Confirm Password'} placement={'topLeft'}>
              <input
                type="Password"
                id="re-password"
                placeholder={'Confirm Password'}
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
              />
            </Tooltip>
            <button type="button" onClick={async () => handleSignUp()}>
              SIGN UP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
