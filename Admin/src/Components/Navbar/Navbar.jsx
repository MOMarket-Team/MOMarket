import React, { useState } from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png';

const Navbar = ({ adminName, setAdminName }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminName');
        setAdminName(null); // Clear admin name in parent state
        window.location.href = '/login'; // Redirect to login page
    };

    return (
        <div className="navbar">
            <img src={logo} alt="Logo" className="nav-logo" />
            <p className="title">MANGU MARKET</p>
            <div className="nav-dropdown">
                <button
                    className="nav-button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    {adminName || "Admin"} ▼
                </button>
                {dropdownOpen && (
                    <div className="dropdown-menu">
                        <button onClick={handleLogout}>Logout</button>
                        <button>Roles</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;