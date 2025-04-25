import React, { useContext } from 'react';
import './Products.css';
import { ProductContext } from '../../Context/ProductContext';
import Item from "../Item/Item";

const AllProducts = () => {
  const { all_product } = useContext(ProductContext);

  return (
    <div className="products-container">
      <h1>Our Products</h1>
      <div className="products-grid">
        {all_product.length === 0 ? (
          <p>Loading...</p>
        ) : (
          all_product.map((product) => (
            <Item
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image}
              price={product.price}
              category={product.category}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AllProducts;