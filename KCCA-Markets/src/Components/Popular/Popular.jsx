import React, { useContext } from "react";
import { ProductContext } from '../../Context/ProductContext';
import "./Popular.css";
import Item from "../Item/Item";

const Popular = () => {
  const { popularProducts } = useContext(ProductContext);

  return (
    <div className="popular">
      <h1>POPULAR FRUITS</h1>
      <hr />
      {popularProducts.length === 0 ? (
        <p>Loading...</p>
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