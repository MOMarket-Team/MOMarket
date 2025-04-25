import React, { useContext } from "react";
import { ProductContext } from "../../Context/ProductContext";
import "./NewCollection.css";
import Item from "../Item/Item";

const NewCollection = () => {
  const { new_collection } = useContext(ProductContext);

  return (
    <div className="products-container">
      <h1>LATEST PRODUCTS ADDED</h1>
      <hr />
      {new_collection.length === 0 ? (
        <div className="loading-message">Loading latest products...</div>
      ) : (
        <div className="products-grid">
          {new_collection.map((item) => (
            <Item
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              price={item.price}
              category={item.category}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewCollection;