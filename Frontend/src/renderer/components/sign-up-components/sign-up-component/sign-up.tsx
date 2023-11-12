import React from 'react';
import './sign-up.scss';
import { useNavigate } from 'react-router-dom';

export function SignUp() {
  const navigate = useNavigate();

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
                  navigate('/sign-in');
                }}
              >
                Login
              </span>
              <span id="sign-up">Sign Up</span>
            </div>
          </div>

          <form>
            <input id="name" placeholder={'Name of Company'} />
            <input type="Email" id="email" placeholder={'Email of Company'} />
            <button
              type="button"
              onClick={() => {
                navigate('/sign-up-details');
              }}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
