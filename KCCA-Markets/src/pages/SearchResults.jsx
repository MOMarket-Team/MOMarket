import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProductContext } from "../Context/ProductContext";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const { searchProducts } = useContext(ProductContext);
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    if (query && query.trim() !== "") {
      const matchedProducts = searchProducts(query.trim());
      setResults(matchedProducts);
    } else {
      setResults([]);
    }
  }, [query, searchProducts]);

  const handleResultClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="search-results-page">
      {results.length > 0 ? (
        <div className="search-grid">
          {results.map((product) => (
            <div
              key={product.id}
              className="search-grid-item"
              onClick={() => handleResultClick(product.id)}
            >
              <h3>{product.name}</h3>
              <p>{product.category}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "1rem", textAlign: "center" }}>
          <p>No results found.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;