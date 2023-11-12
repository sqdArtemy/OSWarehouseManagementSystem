import React from 'react';
import './sign-up-details.scss';
import { useNavigate } from 'react-router-dom';

export function SignUpDetails() {
  const navigate = useNavigate();

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
            <input id="name" placeholder={'Full Name'} />
            <input id="number" placeholder={'Phone Number'} />
            <input type="Email" id="email" placeholder={'Email'} />
            <input type="Password" id="password" placeholder={'Password'} />
            <input
              type="Password"
              id="re-password"
              placeholder={'Confirm Password'}
            />
            <button
              type="button"
              onClick={() => {
                navigate('/owner');
              }}
            >
              SIGN UP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
