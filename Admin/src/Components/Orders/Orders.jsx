import React, { useEffect, useState } from 'react';
import './Orders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  useEffect(() => {
    fetch('https://mangumarket.up.railway.app/admin/orders')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
        }
      })
      .catch((error) => console.error('Error fetching orders:', error));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate service fee consistently
  const calculateServiceFee = (subtotal) => {
    return Math.round(subtotal * 0.2);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    fetch(`https://mangumarket.up.railway.app/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

  const deleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      fetch(`https://mangumarket.up.railway.app/admin/orders/${orderId}`, {
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

  const OrderCard = ({ order }) => {
    const serviceFee = calculateServiceFee(order.subtotal);
    return (
      <div className="order-card">
        <div className="order-card-header">
          <h3>Order #{order._id.slice(-6)}</h3>
          <span className={`status-badge ${order.status}`}>{order.status}</span>
        </div>
        <div className="order-card-body">
          <p><strong>Customer:</strong> {order.userId?.name || 'N/A'}</p>
          <p><strong>Phone:</strong> {order.phone}</p>
          <p><strong>Location:</strong> {order.location}</p>
          <p><strong>Subtotal:</strong> UGX{order.subtotal.toLocaleString()}</p>
          <p><strong>Service Fee (20%):</strong> UGX{serviceFee.toLocaleString()}</p>
          <p><strong>Delivery Fee:</strong> UGX{order.deliveryFee.toLocaleString()}</p>
          <p><strong>Total:</strong> UGX{order.totalAmount.toLocaleString()}</p>
          <p><strong>Date:</strong> {new Date(order.date).toLocaleString()}</p>
          
          <div className="order-products">
            <strong>Products:</strong>
            {order.cartData?.map((item, index) => (
              <div key={index} className="product-item">
                {item.product?.name || 'Unknown Product'} ×{item.quantity}
                <div className="price-details">
                  <span>Price: UGX{item.product?.price ? (item.product.price * item.quantity).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="order-actions">
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
              className="status-select"
            >
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => deleteOrder(order._id)}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-orders">
      <h1>All Orders</h1>
      
      {isMobile ? (
        <div className="orders-card-container">
          {orders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Delivery Time</th>
              <th>Subtotal</th>
              <th>Service Fee</th>
              <th>Delivery Fee</th>
              <th>Total Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const serviceFee = calculateServiceFee(order.subtotal);
              return (
                <tr key={order._id}>
                  <td>{order.userId?.name || 'N/A'}</td>
                  <td>{order.phone}</td>
                  <td>{order.location}</td>
                  <td>{order.deliveryTime || 'N/A'}</td>
                  <td>UGX{order.subtotal.toLocaleString()}</td>
                  <td>UGX{serviceFee.toLocaleString()}</td>
                  <td>UGX{order.deliveryFee.toLocaleString()}</td>
                  <td>UGX{order.totalAmount.toLocaleString()}</td>
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
                    {order.cartData?.map((item, index) => (
                      <div key={index} style={{ marginBottom: '10px' }}>
                        <strong>{item.product?.name || 'Unknown Product'}</strong> ×{item.quantity} <br />
                        Price: <strong>UGX{item.product?.price ? (item.product.price * item.quantity).toLocaleString() : 'N/A'}</strong>
                        <hr />
                      </div>
                    ))}
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
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;