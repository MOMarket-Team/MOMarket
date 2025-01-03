import { useEffect, useState } from "react";
import "./ClientOrders.css";

const ClientOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        setError("Not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:4000/api/orders/my-orders",
          {
            headers: {
              "auth-token": token,
            },
          }
        );
        const data = await response.json();

        if (data.success) {
          setOrders(data.orders);
        } else {
          setError(data.message || "Failed to fetch orders");
        }
      } catch (error) {
        setError("Error fetching orders. Please try again later.");
        console.error("Error fetching client orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); // Removed token dependency since we're getting it inside useEffect

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("auth-token");

    if (!token) {
      alert("Please log in to update orders");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update order locally to avoid refetch
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        alert(data.message || "Failed to update order status");
      }
    } catch (error) {
      alert("Error updating order status. Please try again.");
      console.error("Error updating order status:", error);
    }
  };

  if (loading) return <div className="client-orders">Loading...</div>;
  if (error) return <div className="client-orders error">{error}</div>;
  if (!orders.length)
    return <div className="client-orders">No orders found</div>;

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
