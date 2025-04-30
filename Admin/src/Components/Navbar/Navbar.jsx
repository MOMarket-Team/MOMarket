import React, { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png';

const Navbar = () => {
    const [adminName, setAdminName] = useState('Admin');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Fetch the logged-in admin's name
    useEffect(() => {
        const fetchAdminDetails = async () => {
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    const response = await fetch('https://momarket-7ata.onrender.com/admin/details', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setAdminName(data.name || 'Admin');
                    } else {
                        console.error('Failed to fetch admin details');
                    }
                } catch (error) {
                    console.error('Error fetching admin details:', error);
                }
            }
        };
        fetchAdminDetails();
    }, []);

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/login'; // Redirect to the login page
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
                    {adminName} ▼
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