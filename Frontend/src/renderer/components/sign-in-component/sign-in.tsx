import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../index';
import './sign-in.scss';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSignIn = async () => {
    console.log('email', email);
    console.log('password', password);
    const response = await userApi.signIn(email, password);

    if (response.success) {
      switch (response.data?.user_role) {
        case 'owner':
          navigate('/owner');
          break;
        default:
          break;
      }
    } else {
      // some error message
    }
  };

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
                  navigate('/sign-up');
                }}
              >
                Sign Up
              </span>
            </div>
          </div>
          <form>
            <input
              type="email"
              id="email"
              placeholder={'Email'}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              id="password"
              placeholder={'Password'}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={async () => handleSignIn()}>
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
