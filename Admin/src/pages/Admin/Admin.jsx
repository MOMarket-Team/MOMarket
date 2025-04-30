import React from 'react';
import './Admin.css';
import Sidebar from '../../Components/Sidebar/Sidebar';
import { Routes, Route, Navigate } from 'react-router-dom';
import AddProduct from '../../Components/AddProduct/AddProduct';
import ListProduct from '../../Components/ListProduct/ListProduct';
import Orders from '../../Components/Orders/Orders.jsx';

const Admin = () => {
    return (
        <div className="admin">
            {/* Sidebar for navigation */}
            <Sidebar />
            <div className="admin-content">
                <Routes>
                    {/* Relative paths for admin routes */}
                    <Route path="addproduct" element={<AddProduct />} />
                    <Route path="listproduct" element={<ListProduct />} />
                    <Route path="orders" element={<Orders />} />
                    {/* Redirect to orders as the default admin route */}
                    <Route index element={<Navigate to="orders" replace />} />
                </Routes>
            </div>
        </div>
    );
};

export default Admin;