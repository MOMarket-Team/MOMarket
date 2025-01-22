import React, { useEffect, useState } from "react";
import "./Popular.css";
//import data_product from '../Assets/data'. nolonger needed coz of fetching from DB
import Item from "../Item/Item";

const Popular = () => {
  // all process of fetching from DB
  const [popularProducts, setPopularProducts] = useState([]);
  useEffect(() => {
    fetch("https://momarket-7ata.onrender.com/popularinfruit")
      .then((response) => response.json())
      .then((data) => setPopularProducts(data));
  }, []);
  return (
    <div className="popular">
      <h1>POPULAR FRUITS</h1>
      <hr />
      <div className="popular-item">
        {popularProducts.map((item, i) => {
          return (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              price={item.price}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Popular;
