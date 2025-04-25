import React, { useEffect, useState, useContext } from "react";
import "./RelatedProducts.css";
import Item from "../Item/Item";
import { ProductContext } from "../../Context/ProductContext";

const RelatedProducts = ({ selectedCategory }) => {
  const { getProductsByCategory } = useContext(ProductContext);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCategory) {
      console.log("No category selected");
      setLoading(false);
      return;
    }

    const products = getProductsByCategory(selectedCategory);
    setRelatedProducts(products);
    setLoading(false);
  }, [selectedCategory, getProductsByCategory]);

  return (
    <div className="relatedproducts">
      <h1>Related Products</h1>
      <hr />
      {loading ? (
        <div className="loading-message">Loading related products...</div>
      ) : (
        <div className="relatedproducts-item">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((item) => (
              <Item
                key={item.id}
                id={item.id}
                name={item.name}
                image={item.image}
                price={item.price}
                category={item.category}
              />
            ))
          ) : (
            <p className="no-products-message">No related products found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;