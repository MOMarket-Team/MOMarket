import React, { useContext, useState } from 'react';
import './CSS/ProductCategory.css';
import { ProductContext } from '../Context/ProductContext';
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import Item from '../Components/Item/Item';

const ProductsCategory = (props) => {
  const { all_product } = useContext(ProductContext);
  const [visibleCount, setVisibleCount] = useState(9); // Initial number of products displayed

  // Filter products based on category
  const categoryProducts = all_product.filter(item => item.category === props.category);

  // Handle "Explore More" click
  const handleExploreMore = () => {
    setVisibleCount(categoryProducts.length); // Show all products in the category
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
      {visibleCount < categoryProducts.length && ( // Show "Explore More" only if there are more products
        <div className="loadmore" onClick={handleExploreMore}>
          Explore More
        </div>
      )}
    </div>
  );
};

export default ProductsCategory;