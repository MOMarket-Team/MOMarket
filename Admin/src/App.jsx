import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar.jsx';
import Admin from './pages/Admin/Admin.jsx';
import Login from './pages/Login/Login.jsx';

const App = () => {
    const [adminName, setAdminName] = useState(null); // State for admin's name

    // Check if the admin is already logged in on app load
    useEffect(() => {
        const token = sessionStorage.getItem('adminToken');
        const storedAdminName = sessionStorage.getItem('adminName');

        if (token) {
            setAdminName(storedAdminName || "Admin"); // Use stored name or default to "Admin"
        }
    }, []);

    return (
        <div>
            {/* Only show Navbar if the user is logged in */}
            {sessionStorage.getItem('adminToken') && <Navbar adminName={adminName} setAdminName={setAdminName} />}
            <Routes>
                {/* Default route redirects to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Login route - redirect to admin dashboard if already logged in */}
                <Route
                    path="/login"
                    element={
                        sessionStorage.getItem('adminToken') ? (
                            <Navigate to="/admin/orders" replace />
                        ) : (
                            <Login setAdminName={setAdminName} />
                        )
                    }
                />

                {/* Protected admin routes */}
                <Route
                    path="/admin/*"
                    element={
                        sessionStorage.getItem('adminToken') ? (
                            <Admin />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Catch-all route redirects to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </div>
    );
};

export default App;