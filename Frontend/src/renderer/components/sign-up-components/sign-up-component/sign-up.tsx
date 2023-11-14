import React, { useState } from 'react';
import './sign-up.scss';
import { useNavigate } from 'react-router-dom';

export function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleContinue = () => {
    navigate('/sign-up-details', {
      state: { name, email, address },
    });
  };

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
            <input
              id="name"
              placeholder={'Name of Company'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              id="name"
              placeholder={'Address of Company'}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <input
              type="email"
              id="email"
              placeholder={'Email of Company'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="button" onClick={handleContinue}>
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

