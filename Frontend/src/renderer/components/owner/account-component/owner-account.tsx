import React from 'react';
import { useState } from 'react';
import './owner-account.scss';

export default function OwnerAccount() {
  const [changePassDisplay, setChangePassDisplay] = useState(false)
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
            {!changePassDisplay ? ( <span className="">Password:</span>) : (<><span> Current Password: </span><span>New Password:</span><span>Confirm Password:</span></>)}
          </div>
          <div className="inputs">
            <input className="first-name"/>
            <input className="last-name"/>
            <input type="email"className="email"/>
            <input type="phone" className="phone"/>
            {!changePassDisplay ? (<input type="password" />) : (<><input type="password" /><input type="password" /><input type="password" /></>)}
            <div className="buttons">
              <button id="change-pass"
                      onClick={
                        ()=>setChangePassDisplay(true)
                        }>
                        Change Password
              </button>
              <button id="reset">Reset</button>
              <button id="save">Save</button>
            </div>
          </div>
        </div>
  </div>
  );
}
