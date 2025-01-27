import React, { useState, useContext, useEffect } from "react";
import { ProductContext } from "../Context/ProductContext";
import { useNavigate } from "react-router-dom";
import './CSS/ManualOrder.css';

const ManualOrder = () => {
  const { addTocart } = useContext(ProductContext);
  const [orders, setOrders] = useState([
    { title: "", pricePerKg: 0, weight: 1, total: 0 },
    { title: "", pricePerKg: 0, weight: 1, total: 0 },
    { title: "", pricePerKg: 0, weight: 1, total: 0 },
    { title: "", pricePerKg: 0, weight: 1, total: 0 },
    { title: "", pricePerKg: 0, weight: 1, total: 0 },
  ]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch products from the backend
    fetch("https://momarket-7ata.onrender.com/allproducts")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleInputChange = (index, field, value) => {
    const updatedOrders = [...orders];
    if (field === "title") {
      const matchedProduct = products.find(
        (p) => p.name.toLowerCase() === value.toLowerCase()
      );
      if (matchedProduct) {
        setError("");
        updatedOrders[index].title = matchedProduct.name;
        updatedOrders[index].pricePerKg = matchedProduct.price;
        updatedOrders[index].total = (
          matchedProduct.price * updatedOrders[index].weight
        ).toFixed(2);
      } else {
        setError("Product Not Available");
        updatedOrders[index].title = value; // Allow input while showing the error
        updatedOrders[index].pricePerKg = 0;
        updatedOrders[index].total = 0;
      }
    } else if (field === "weight") {
      const weight = parseFloat(value);
      updatedOrders[index].weight = weight;
      updatedOrders[index].total = (
        updatedOrders[index].pricePerKg * weight
      ).toFixed(2);
    }
    setOrders(updatedOrders);
  };

  const handleAddRow = () => {
    setOrders([
      ...orders,
      { title: "", pricePerKg: 0, weight: 1, total: 0 },
    ]);
  };

  const handleRemoveRow = (index) => {
    const updatedOrders = orders.filter((_, i) => i !== index);
    setOrders(updatedOrders);
  };

  const handleAddToCart = () => {
    orders.forEach((order) => {
      if (order.title && order.pricePerKg && order.weight) {
        addTocart({
          name: order.title,
          price: parseFloat(order.pricePerKg),
          quantity: parseFloat(order.weight),
        });
      }
    });
    navigate("/cart");
  };

  const calculateGrandTotal = () => {
    return orders.reduce((total, order) => total + parseFloat(order.total || 0), 0).toFixed(2);
  };

  return (
    <div className="manual-order-page">
      <h1>Manual Order</h1>
      {error && <p className="error-msg">{error}</p>}
      <table className="order-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Weight (kg)</th>
            <th>Price per kg</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={order.title}
                  list="product-list"
                  onChange={(e) =>
                    handleInputChange(index, "title", e.target.value)
                  }
                />
                <datalist id="product-list">
                  {products.map((product) => (
                    <option key={product.id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </datalist>
              </td>
              <td>
                <input
                  type="number"
                  value={order.weight}
                  step="0.5"
                  min="0.5"
                  onChange={(e) =>
                    handleInputChange(index, "weight", e.target.value)
                  }
                />
              </td>
              <td>UGX {order.pricePerKg}</td>
              <td>
                <button onClick={() => handleRemoveRow(index)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddRow}>Add Row</button>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <h2>Total: UGX {calculateGrandTotal()}</h2>
    </div>
  );
};

export default ManualOrder;