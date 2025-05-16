import React, { useEffect, useState } from 'react';
import './ClientOrders.css';

const ClientOrders = () => {
    const [orders, setOrders] = useState([]);
    const token = localStorage.getItem('auth-token');

    // Fetch orders function
    const fetchOrders = async () => {
        try {
            const response = await fetch('https://mangumarket.up.railway.app/my-orders', {
                headers: { 'auth-token': token },
            });
            const data = await response.json();

            if (data.success) {
                setOrders(data.orders);
            } else {
                console.error('Failed to fetch orders:', data.message);
            }
        } catch (error) {
            console.error('Error fetching client orders:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    const updateOrderStatus = (orderId, newStatus) => {
        fetch(`https://mangumarket.up.railway.app/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert('Order status updated successfully');
                    // Fetch updated orders
                    fetchOrders();
                } else {
                    alert('Failed to update order status');
                }
            })
            .catch((error) => console.error('Error updating order status:', error));
    };

    return (
        <div className="client-orders">
            <h1>My Orders</h1>
            <table>
                <thead>
                    <tr>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Total Amount</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td>{order.phone}</td>
                            <td>{order.location}</td>
                            <td>${order.totalAmount}</td>
                            <td>{order.paymentMethod}</td>
                            <td>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </td>
                            <td>{new Date(order.date).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClientOrders;