import React, { useEffect, useState } from 'react';
import './Products.css';
import { Link } from 'react-router-dom';

const AllProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('https://momarket.onrender.com/allproducts')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  return (
    <div className="products-container">
      <h1>Our Products</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            {/* Link for the product image */}
            <Link to={`/product/${product.id}`} state={{ category: product.category }}>
              <img src={product.image} alt={product.name} />
            </Link>
            {/* Link for the product name */}
            <Link to={`/product/${product.id}`} state={{ category: product.category }} className="product-name">
              <h3>{product.name}</h3>
            </Link>
            {/* Price display */}
            <p>UGX {product.price} /KG</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllProducts;