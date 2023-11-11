import React from 'react';
import './sign-in.scss';

export function SignIn() {
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
              <span id='sign-in'>Sign In</span>
            </div>
            <div className='tabs-right'>
              <span id='login'>Login</span>
              <span className='disabled' id='sign-up'>Sign Up</span>
            </div>
          </div>

          <form>
            <input type='email' id='email' placeholder={'Email'} />
            <input type='password' id='password' placeholder={'Password'} />
            <button type='submit'>SIGN IN</button>
          </form>

        </div>

      </div>
    </div>
  );
}
