import React, { useEffect, useState } from 'react';
import './sign-up.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Tooltip } from 'antd';

export function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
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
  } = location.state || {};

  const handleContinue = () => {
    console.log('name', name);
    console.log('email', email);
    console.log('address', address);
    navigate('/sign-up-details', {
      state: {
        locLoginEmail: locLoginEmail,
        locLoginPassword: locLoginPassword,
        locName: name,
        locEmail: email,
        locAddress: address,
        locFirstName: locFirstName,
        locLastName: locLastName,
        locUserEmail: locUserEmail,
        locPhoneNumber: locPhoneNumber,
        locPassword: locPassword,
        locRePassword: locRePassword,
      },
    });
  };

  useEffect(() => {
    console.log('locName', locName);
    console.log('locEmail', locEmail);
    console.log('locAddress', locAddress);
    setName(locName);
    setEmail(locEmail);
    setAddress(locAddress);
  }, [locName, locEmail, locAddress]);

  return (
    <div className="sign-up-container">
      <header>WAREHOUSE MANAGEMENT SYSTEM</header>
      <div className="content">
        <div className="sign-up-form">
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
                  navigate('/sign-in', {
                    state: {
                      locLoginEmail: locLoginEmail,
                      locLoginPassword: locLoginPassword,
                      locName: name,
                      locEmail: email,
                      locAddress: address,
                      locFirstName: locFirstName,
                      locLastName: locLastName,
                      locUserEmail: locUserEmail,
                      locPhoneNumber: locPhoneNumber,
                      locPassword: locPassword,
                      locRePassword: locRePassword,
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
            <Tooltip title={'Input Name of Company'} placement={'topLeft'}>
              <input
                id="name"
                placeholder={'Name of Company'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Input Address of Company'} placement={'topLeft'}>
              <input
                id="name"
                placeholder={'Address of Company'}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Tooltip>
            <Tooltip title={'Input Email of Company'} placement={'topLeft'}>
              <input
                type="email"
                id="email"
                placeholder={'Email of Company'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Tooltip>
            <Button type="primary" onClick={handleContinue}>
              Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
