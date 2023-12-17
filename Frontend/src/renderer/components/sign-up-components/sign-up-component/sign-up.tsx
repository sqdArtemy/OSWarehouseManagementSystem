import React, { useEffect, useState } from 'react';
import './sign-up.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Select, Tooltip } from 'antd';

const roles: Select['OptionType'][] = [
  { value: 'manager', label: 'Manager' },
  { value: 'vendor', label: 'Vendor' },
];

export function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<Select['ValueType']>(' ');
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
        locRole: role,
        locUserAddress: locUserAddress,
      },
    });
  };

  useEffect(() => {
    console.log('locName', locName);
    console.log('locEmail', locEmail);
    console.log('locAddress', locAddress);
    setName(locName || '');
    setEmail(locEmail || '');
    setAddress(locAddress || '');
    setRole(locRole || '');
  }, [locName, locEmail, locAddress]);

  const onRoleChange = (value) => {
    setRole(value);
  };

  return (
    <div className="sign-up-container">
      <header>WAREHOUSE MANAGEMENT SYSTEM</header>
      <div className="content">
        <div className="sign-up-form">
          <div className="tabs-container">
            <div className="tabs-left">
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
                      locRole: role,
                      locUserAddress: locUserAddress,
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
            <Tooltip title={'Select a Role'} placement={'topLeft'}>
              <Select
                className={'sign-up-select-role'}
                placeholder={'Select a Role'}
                value={role ? role : undefined}
                onChange={(value) => onRoleChange(value)}
                style={{
                  minHeight: '2vw',
                  marginBottom: '1vw',
                  fontSize: '1.3vw',
                }}
                options={roles}
              ></Select>
            </Tooltip>
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
            <Button
              type="primary"
              style={{ minHeight: '1.8vw', fontSize: '0.9vw' }}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
