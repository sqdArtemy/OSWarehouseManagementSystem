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
            <span className="span">First Name: </span>
            <span className="span">Last Name:</span>
            <span className="span">Email:</span>
            <span className="span">Phone:</span>
            {!changePassDisplay ? ( <span className="span">Password:</span>) : (<><span className="span"> Current Password: </span><span className="span">New Password:</span><span className="span">Confirm Password:</span></>)}
          </div>
          <div className="inputs">
            <input className="input" id="first-name"/>
            <input className="input" id="last-name"/>
            <input type="email" className="input" id="email"/>
            <input type="phone" className="input" id="phone"/>
            {!changePassDisplay ? (<input type="password" className="input"/>) : (<><input type="password" className="input"/><input type="password" className="input"/><input type="password" className="input"/></>)}
            <div className="buttons">
              <button  className="button" id="change-pass"
                      onClick={
                        ()=>setChangePassDisplay(true)
                        }>
                        Change Password
              </button>
              <button className="button" id="reset">Reset</button>
              <button className="button" id="save">Save</button>
            </div>
          </div>
        </div>
  </div>
  );
}
