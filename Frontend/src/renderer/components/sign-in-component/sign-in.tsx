import React from 'react';
import './sign-in.scss';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../index';

export function SignIn() {
  const navigate = useNavigate();

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
              <span className="disabled" id="sign-up">
                Sign Up
              </span>
            </div>
          </div>

          <form>
            <input type="email" id="email" placeholder={'Email'} />
            <input type="password" id="password" placeholder={'Password'} />
            <button
              type="submit"
              onClick={async () => {
                navigate('/owner');
                // const testMessage = await apiClient.send(
                //   {"url": "/user/register",
                //      "method": "POST",
                //      "body": {"company_name": "test", "company_address": "test", "company_email": "tets@gmail.com", "user_name": "TestUser", "user_surname": "TestSurname", "user_email": "test@user.mail", "user_role": "owner", "user_phone": "+9989778284", "password": "test123", "confirm_password": "test123"},
                //      headers: {}
                //   });
                // console.log(testMessage);
              }}
            >
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
