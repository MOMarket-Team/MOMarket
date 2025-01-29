import React from 'react';
import './NewsLetter.css';

const NewsLetter = () => {
  return (
    <div className='newsletter'>
        <h1>Fresh Deals, Straight to Your Inbox!</h1>
        <p>Subscribe now to get exclusive discounts on fresh produce and market specials.</p>
        <div>
            <input type="email" placeholder='Enter your email' />
            <button>Subscribe Now</button>
        </div>
    </div>
  );
}

export default NewsLetter;