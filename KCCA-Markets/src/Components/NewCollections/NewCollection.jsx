import React, { useEffect, useState } from "react";
import "./NewCollection.css"; // Ensure this CSS file matches Products.css
import { Link } from "react-router-dom";
import eye_icon from "../Assets/eye.png"; // Import the eye icon if needed

const NewCollection = () => {
  const [new_collection, setNew_collection] = useState([]);

  useEffect(() => {
    fetch("https://momarket-7ata.onrender.com/newcollections")
      .then((response) => response.json())
      .then((data) => setNew_collection(data))
      .catch((error) => console.error("Error fetching new collections:", error));
  }, []);

  return (
    <div className="products-container">
      <h1>LATEST PRODUCTS ADDED</h1>
      <hr />
      <div className="products-grid">
        {new_collection.map((item) => (
          <div key={item.id} className="product-card">
            {/* Link for the product image */}
            <Link to={`/product/${item.id}`} state={{ category: item.category }}>
              <img src={item.image} alt={item.name} />
            </Link>
            {/* Link for the product name */}
            <Link
              to={`/product/${item.id}`}
              state={{ category: item.category }}
              className="product-name"
            >
              <h3>{item.name}</h3>
            </Link>
            {/* Price display */}
            <p>UGX {item.price}</p>

            {/* View Details Section */}
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
    </div>
  );
};

export default NewCollection;