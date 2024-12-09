import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/logo.png';
import me from '../../assets/me.jpg';

const Navbar = () => {
    return (
        <div className="navbar">
            <img src={logo} alt="Logo" className="nav-logo" />
            <p className="title">
                KCCA <br />
                MARKET <br />
                MASTERS
            </p>
            <div className="nav-links">
                <Link to="/admin/orders">Orders</Link>
            </div>
            <img src={me} alt="Profile" className="nav-profile" />
        </div>
    );
};

export default Navbar;