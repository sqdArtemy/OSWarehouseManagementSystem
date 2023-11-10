import React from 'react';
import './sign-up-2.scss';

export function SignUp_2() {
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
            <input id='name' placeholder={'Full Name'} />
            <input id='number' placeholder={'Phone Number'}/>
            <input type='Email' id='email' placeholder={'Email'} />
            <input type='Password' id='password' placeholder={'Password'}/>
            <input type='Password' id='re-password' placeholder={'Confirm Password'}/>
            <button type='submit'>SIGN UP</button>
          </form>

        </div>

      </div>
    </div>
  );
}
