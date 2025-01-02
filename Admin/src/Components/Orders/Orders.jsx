import React, { useEffect, useState } from 'react';
import './Orders.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);

    // Fetch orders
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

    // Function to update order status
    const updateOrderStatus = (orderId, newStatus) => {
        fetch(`http://localhost:4000/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
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

    // Function to delete an order
    const deleteOrder = (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            fetch(`http://localhost:4000/admin/orders/${orderId}`, {
                method: 'DELETE',
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        setOrders((prevOrders) =>
                            prevOrders.filter((order) => order._id !== orderId)
                        );
                        alert('Order deleted successfully');
                    } else {
                        alert('Failed to delete order');
                    }
                })
                .catch((error) => console.error('Error deleting order:', error));
        }
    };

    return (
        <div className="admin-orders">
            <h1>All Orders</h1>
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Total Amount</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Products</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td>{order.userId?.name || 'N/A'}</td>
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
                            <td>
                                {order.cartData
                                    ?.map(
                                        (item) =>
                                            `${item.product?.name || 'Unknown Product'} X${item.quantity}`
                                    )
                                    .join(', ')}
                            </td>
                            <td>
                                <button
                                    onClick={() => deleteOrder(order._id)}
                                    className="delete-button"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminOrders;