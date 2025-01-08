import React from "react";
import "./NewCollection.css";
// import new_collection from '../Assets/new_collections' .coz we are now fetching from DB
import Item from "../Item/Item";
import { useState } from "react";
import { useEffect } from "react";

const NewCollection = () => {
  // under newcollection,the lastest products only will be added.
  const [new_collection, setNew_collection] = useState([]);
  useEffect(() => {
    fetch("https://momarket.onrender.com/newcollections")
      .then((response) => response.json())
      .then((data) => setNew_collection(data));
  }, []);
  return (
    <div className="newcollections">
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {new_collection.map((item, i) => {
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

export default NewCollection;
