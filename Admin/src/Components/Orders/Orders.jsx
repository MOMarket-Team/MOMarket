import React, { useEffect, useState } from 'react';
import './Orders.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetch('http://localhost:4000/admin/orders')
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setOrders(data.orders);
                }
            })
            .catch((error) => console.error('Error fetching orders:', error));
    }, []);

    return (
        <div className="admin-orders">
            <h1>All Orders</h1>
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Total Amount</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Products</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.userId?.name || 'N/A'} ({order.userId?.email})</td>
                            <td>{order.phone}</td>
                            <td>{order.location}</td>
                            <td>${order.totalAmount}</td>
                            <td>{order.paymentMethod}</td>
                            <td>{order.status}</td>
                            <td>{new Date(order.date).toLocaleString()}</td>
                            <td>
                                {order.cartData.map((item, index) => (
                                    <div key={index}>
                                        {item.product.title || 'N/A'}: Quantity: {item.quantity}
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminOrders;