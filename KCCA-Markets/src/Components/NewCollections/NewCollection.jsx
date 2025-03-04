import React from "react";
import "./NewCollection.css"; // Updated CSS file
import Item from "../Item/Item";
import { useState } from "react";
import { useEffect } from "react";

const NewCollection = () => {
  const [new_collection, setNew_collection] = useState([]);
  useEffect(() => {
    fetch("https://momarket-7ata.onrender.com/newcollections")
      .then((response) => response.json())
      .then((data) => setNew_collection(data));
  }, []);

  return (
    <div className="products-container">
      <h1>LATEST PRODUCTS ADDED</h1>
      <hr />
      <div className="products-grid">
        {new_collection.map((item, i) => {
          return (
            <div key={i} className="product-card">
              <Item
                id={item.id}
                name={item.name}
                image={item.image}
                price={item.price}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewCollection;