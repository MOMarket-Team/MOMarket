import React, { useContext, useState, useEffect } from 'react';
import './CSS/ProductCategory.css';
import { ProductContext } from '../Context/ProductContext';
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import Item from '../Components/Item/Item';

const ProductsCategory = (props) => {
  const { all_product } = useContext(ProductContext);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);

  // Filter products based on category
  const categoryProducts = all_product.filter(item => item.category === props.category);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle "Explore More" click
  const handleExploreMore = () => {
    setVisibleCount(categoryProducts.length);
  };

  return (
    <div className='product-category'>
      <img className='banner' src={props.banner} alt="" />
      <div className="indexsort">
        <p>
          <span>Showing {Math.min(visibleCount, categoryProducts.length)}</span> out of {categoryProducts.length} products
        </p>
        <div className="sort">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>
      
      {loading ? (
        <div className="loading-message">Loading {props.category} products...</div>
      ) : (
        <>
          <div className="category-products">
            {categoryProducts.slice(0, visibleCount).map((item, i) => (
              <Item
                key={i}
                id={item.id}
                name={item.name}
                image={item.image}
                price={item.price}
              />
            ))}
          </div>
          {visibleCount < categoryProducts.length && (
            <div className="loadmore" onClick={handleExploreMore}>
              Explore More
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsCategory;