import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar.jsx';
import Admin from './pages/Admin/Admin.jsx';
import Login from './pages/Login/Login.jsx';

const App = () => {
    const token = localStorage.getItem('adminToken'); // Check if user is logged in

    return (
        <div>
            {token && <Navbar />} {/* Show Navbar only if logged in */}
            <Routes>
                {/* Route for login */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />

                {/* Render Admin after login */}
                {token && <Route path="/admin/*" element={<Admin />} />}
            </Routes>
        </div>
    );
};

export default App;
