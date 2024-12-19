import React, { useEffect, useState } from 'react';
import './ClientOrders.css';

const ClientOrders = () => {
    const [orders, setOrders] = useState([]);
    const token = localStorage.getItem('auth-token');

    useEffect(() => {
        const fetchOrders = async () => {
          try {
            const response = await fetch('http://localhost:4000/my-orders', {
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
      
        fetchOrders();
      }, [token]);
      
    const updateOrderStatus = (orderId, newStatus) => {
        fetch(`http://localhost:4000/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': token,
            },
            body: JSON.stringify({ status: newStatus }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setOrders((prevOrders) =>
                        prevOrders.map((order) =>
                            order._id === orderId ? { ...order, status: newStatus } : order
                        )
                    );
                    alert('Order status updated successfully');
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