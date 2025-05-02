import React, { useEffect, useState } from 'react';
import './Orders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  useEffect(() => {
    fetch('https://momarket-7ata.onrender.com/admin/orders')
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

  const updateOrderStatus = (orderId, newStatus) => {
    fetch(`https://momarket-7ata.onrender.com/admin/orders/${orderId}/status`, {
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
      fetch(`https://momarket-7ata.onrender.com/admin/orders/${orderId}`, {
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

  const calculateProfit = (price, quantity) => {
    return price * quantity * 0.2; // 20% profit
  };
  
  const calculateActualPrice = (price, quantity) => {
    const fullPrice = price * quantity;
    const profit = fullPrice * 0.2;
    return fullPrice - profit; // Actual price after subtracting 20% profit
  };

  const OrderCard = ({ order }) => {
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
          <p><strong>Total:</strong> UGX{order.totalAmount}</p>
          <p><strong>Date:</strong> {new Date(order.date).toLocaleString()}</p>
          
          <div className="order-products">
            <strong>Products:</strong>
            {order.cartData?.map((item, index) => {
              const actualPrice = calculateActualPrice(item.product?.price || 0, item.quantity);
              const profit = calculateProfit(item.product?.price || 0, item.quantity);
              return (
                <div key={index} className="product-item">
                  {item.product?.name || 'Unknown Product'} ×{item.quantity}
                  <div className="price-details">
                    <span>Cost: UGX{actualPrice.toFixed(0)}</span>
                    <span>Profit: UGX{profit.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
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
              <th>Subtotal (Without Delivery)</th>
              <th>Delivery Fee</th>
              <th>Total Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Products Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.userId?.name || 'N/A'}</td>
                <td>{order.phone}</td>
                <td>{order.location}</td>
                <td>{order.deliveryTime || 'N/A'}</td>
                <td>UGX{order.subtotal}</td>
                <td>UGX{order.deliveryFee}</td>
                <td>UGX{order.totalAmount}</td>
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
                  {order.cartData?.map((item, index) => {
                    const actualPrice = calculateActualPrice(item.product?.price || 0, item.quantity);
                    const profit = calculateProfit(item.product?.price || 0, item.quantity);
                    return (
                      <div key={index} style={{ marginBottom: '10px' }}>
                        <strong>{item.product?.name || 'Unknown Product'}</strong> ×{item.quantity} <br />
                        Product Cost (after Admin Profit): <strong>UGX{actualPrice.toFixed(0)}</strong> <br />
                        Admin Profit: <strong>UGX{profit.toFixed(0)}</strong>
                        <hr />
                      </div>
                    );
                  })}
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
      )}
    </div>
  );
};

export default AdminOrders;