import React from 'react';
import './sign-up.scss';

export function SignUp() {
  return (
    <div className='sign-in-container'>
      <header>WAREHOUSE MANAGEMENT SYSTEM</header>
      <div className='content'>


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
            <input id='name' placeholder={'Name of Company'} />
            <input type='Email' id='email' placeholder={'Email of Company'} />
            <button type='submit'>Continue</button>
          </form>

        </div>

      </div>
    </div>
  );
}
