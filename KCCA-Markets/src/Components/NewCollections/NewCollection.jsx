import React, { useEffect, useState } from "react";
import "./NewCollection.css";
import { Link } from "react-router-dom";
import eye_icon from "../Assets/eye.png";

const NewCollection = () => {
  const [new_collection, setNew_collection] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://momarket-7ata.onrender.com/newcollections")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setNew_collection(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching new collections:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="products-container">
      <h1>LATEST PRODUCTS ADDED</h1>
      <hr />
      {loading ? (
        <div className="loading-message">Loading latest products...</div>
      ) : (
        <div className="products-grid">
          {new_collection.map((item) => (
            <div key={item.id} className="product-card">
              <Link to={`/product/${item.id}`} state={{ category: item.category }}>
                <img src={item.image} alt={item.name} />
              </Link>
              <Link
                to={`/product/${item.id}`}
                state={{ category: item.category }}
                className="product-name"
              >
                <h3>{item.name}</h3>
              </Link>
              <p>UGX {item.price}</p>
              <Link
                to={`/product/${item.id}`}
                state={{ category: item.category }}
                className="view-details"
              >
                <img src={eye_icon} alt="View Details" className="eye-icon" />
                <span>View</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewCollection;