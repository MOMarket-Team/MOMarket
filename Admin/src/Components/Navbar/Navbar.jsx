import React from 'react';
import './Navbar.css'

import logo from '../../assets/logo.png'
import me from '../../assets/me.jpg'

const Navbar = () => {
    return (
        <div className='navbar'>
            <img src={logo} alt="" className="nav-logo" />
            <p className="title">KCCA <br />MARKET <br/>MASTERS</p>
            <img src={me} alt="" className="nav-profile" />
        </div>
    );
};

export default Navbar;