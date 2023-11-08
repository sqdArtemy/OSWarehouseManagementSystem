import React from 'react';
import './sign-up.scss';

export function SignUp() {
  return (
    <div className='sign-in-container'>
      <header>WAREHOUSE MANAGEMENT SYSTEM</header>
      <div className='content'>

        <div className='status-icons'>
          <div className='status-icon' id='sh'>SH</div>
          <div className='status-icon' id='mng'>MNG</div>
          <div className='status-icon' id='str'>STR</div>
        </div>

        <div className='login-form'>

          <div className='tabs-container'>
            <div className='tabs-left'>
              <span id='id'>ID</span>
              <span id='sign-in'>Sign Up</span>
            </div>
            <div className='tabs-right'>
              <span className='disabled' id='login'>Login</span>
              <span id='sign-up'>Sign Up</span>
            </div>
          </div>

          <form>
            <input id='email' placeholder={'Name'} />
            <input type='Email' id='password' placeholder={'Email'} />
            <button type='submit'>Continue</button>
          </form>

        </div>

      </div>
    </div>
  );
}
