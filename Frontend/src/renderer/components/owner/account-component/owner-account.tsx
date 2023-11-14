import React from 'react';
import './owner-account.scss';

export default function OwnerAccount() {
  return (
  <div className="owner-account-container">
    <div className='header'>
      <span className="label" id="label">User Info</span>
    </div>
        <div className="owner-account-form">
          <div className="titles">
            <span className="">First Name: </span>
            <span className="">Last Name:</span>
            <span className="">Email:</span>
            <span className="">Phone:</span>
            <span className="">Password:</span>
          </div>
          <div className="inputs">
            <input />
            <input />
            <input />
            <input />
            <input type="password" />
            <div className="buttons">
              <button id="submit">Change Password</button>
            </div>
          </div>
        </div>
  </div>
  );
}
