import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProductContext } from "../Context/ProductContext";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const { searchProducts } = useContext(ProductContext);
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const query = new URLSearchParams(location.search).get("q");
  const [hasClicked, setHasClicked] = useState(false);

  // Run search only if user hasn't clicked a result
  useEffect(() => {
    if (hasClicked) return;

    if (query && query.trim() !== "") {
      const matchedProducts = searchProducts(query.trim());
      setResults(matchedProducts);
    } else {
      setResults([]);
    }
  }, [query, searchProducts, hasClicked]);

  // Reset hasClicked when user changes search query (starts typing again)
  useEffect(() => {
    setHasClicked(false);
  }, [query]);

  // Click/hover outside to clear input and results
  useEffect(() => {
    const handleClickOrHoverOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setResults([]);
        navigate("?q=");
      }
    };

    document.addEventListener("mousedown", handleClickOrHoverOutside);
    document.addEventListener("mouseover", handleClickOrHoverOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOrHoverOutside);
      document.removeEventListener("mouseover", handleClickOrHoverOutside);
    };
  }, [navigate]);

  const handleResultClick = (productId) => {
    setHasClicked(true); // Prevent search rerun
    setResults([]);
    navigate(`/product/${productId}`);
  };

  const handleSearchAgain = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="search-results" ref={containerRef}>
      {query && <h1>Search Results for: "{query}"</h1>}
      {results.length > 0 ? (
        results.map((product) => (
          <div
            key={product.id}
            className="search-result-item"
            onClick={() => handleResultClick(product.id)}
          >
            <h2>{product.name}</h2>
          </div>
        ))
      ) : (
        query &&
        query.trim() !== "" && (
          <div style={{ padding: "1rem", textAlign: "center" }}>
            <p>No results found.</p>
            <button className="search-again-btn" onClick={handleSearchAgain}>
              Search
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default SearchResults;