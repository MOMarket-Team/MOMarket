import React, { useEffect, useState } from "react";
import "./Popular.css";
import Item from "../Item/Item";

const Popular = () => {
  // State for popular products and loading status
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch popular products from the backend
  useEffect(() => {
    fetch("https://momarket-7ata.onrender.com/popularinfruit")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setPopularProducts(data);
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching popular products:", error);
        setLoading(false); // Ensure loading is set to false even if there's an error
      });
  }, []);

  return (
    <div className="popular">
      <h1>POPULAR FRUITS</h1>
      <hr />
      {/* Conditional rendering based on loading state */}
      {loading ? (
        <p>Loading...</p> // Display a loading message while fetching data
      ) : (
        <div className="popular-item">
          {popularProducts.map((item, i) => (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              price={item.price}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Popular;