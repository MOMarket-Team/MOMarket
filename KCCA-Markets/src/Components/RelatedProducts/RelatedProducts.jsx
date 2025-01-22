import React, { useEffect, useState } from "react";
import "./RelatedProducts.css";
import Item from "../Item/Item";

const RelatedProducts = ({ selectedCategory }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!selectedCategory) {
        console.log("No category selected");
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching related products for category: ${selectedCategory}`);
        const response = await fetch(`https://momarket-7ata.onrender.com/api/products/${selectedCategory}`);

        if (!response.ok) {
          console.error(`Server returned status: ${response.status}`);
          setLoading(false);
          return;
        }

        const products = await response.json();
        setRelatedProducts(products);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [selectedCategory]);

  if (loading) {
    return <p>Loading related products...</p>;
  }

  return (
    <div className="relatedproducts">
      <h1>Related Products</h1>
      <hr />
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
          <p>No related products found.</p>
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;