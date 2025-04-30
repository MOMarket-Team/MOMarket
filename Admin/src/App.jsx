import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar.jsx';
import Admin from './pages/Admin/Admin.jsx';
import Login from './pages/Login/Login.jsx';

const App = () => {
    const token = localStorage.getItem('adminToken'); // Check if admin is logged in

    // Protected route component
    const ProtectedRoute = ({ children }) => {
        if (!token) {
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    return (
        <div>
            {/* Only show Navbar if the user is logged in */}
            {token && <Navbar />}
            <Routes>
                {/* Default route redirects to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Login route - redirect to admin dashboard if already logged in */}
                <Route
                    path="/login"
                    element={token ? <Navigate to="/admin/orders" replace /> : <Login />}
                />

                {/* Protected admin routes */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute>
                            <Admin />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all route redirects to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </div>
    );
};

export default App;