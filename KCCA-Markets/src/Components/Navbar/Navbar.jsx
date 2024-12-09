import React, { useContext, useRef, useState, useEffect } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import { ProductContext } from "../../Context/ProductContext";
import dropdown_icon from "../Assets/dropdown_icon.png";

const Navbar = () => {
  const [menu, setMenu] = useState("Products");
  // const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const { getTotalItems, cartItems } = useContext(ProductContext);
  // for hiding the menu bar at certain width
  const menuRef = useRef();

  // Get cartItems from local storage
  // useEffect(() => {
  //     if (localStorage.getItem("cartItems")) {
  //       setCartItems(JSON.parse(localStorage.getItem("cartItems")));
  //     }
  //     console.log('');

  //   }, []);

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle("nav-menu-visible");
    e.target.classList.toggle("open");
  };

  // Handle Search
  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:4000/search?q=${e.target.value}`
      );
      if (!response.ok) throw new Error("Failed to fetch search results");
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.products);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/search?q=${searchTerm}`);
    }
  };

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="Logo" />
        <p>
          KCCA ONLINE <br /> MARKETS
        </p>
      </div>
      <img
        className="nav-dropdown"
        onClick={dropdown_toggle}
        src={dropdown_icon}
        alt="Dropdown Icon"
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="nav-search">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchTerm}
              onChange={handleSearch}
            />
          </form>
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((product) => (
                <Link
                  to={`/product/${product.id}`}
                  key={product.id}
                  onClick={() => {
                    setSearchResults([]); // Clear results
                    setSearchTerm(""); // Clear input
                  }}
                >
                  {product.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        <ul ref={menuRef} className="nav-menu">
          <li
            onClick={() => {
              setMenu("Products");
            }}
          >
            <Link style={{ textDecoration: "none" }} to="/">
              Products
            </Link>
            {menu === "Products" ? <hr /> : null}
          </li>
          <li
            onClick={() => {
              setMenu("Fruits");
            }}
          >
            <Link style={{ textDecoration: "none" }} to="/Fruits">
              Fruits
            </Link>
            {menu === "Fruits" ? <hr /> : null}
          </li>
          <li
            onClick={() => {
              setMenu("Foods");
            }}
          >
            <Link style={{ textDecoration: "none" }} to="/Foods">
              Foods
            </Link>
            {menu === "Foods" ? <hr /> : null}
          </li>
          <li
            onClick={() => {
              setMenu("Vegetables");
            }}
          >
            <Link style={{ textDecoration: "none" }} to="/Vegetables">
              Vegetables
            </Link>
            {menu === "Vegetables" ? <hr /> : null}
          </li>
          <li
            onClick={() => {
              setMenu("Sauce");
            }}
          >
            <Link style={{ textDecoration: "none" }} to="/Sauce">
              Sauce
            </Link>
            {menu === "Sauce" ? <hr /> : null}
          </li>
        </ul>
      </div>
      <div className="nav-logo-cart">
        {localStorage.getItem("auth-token") ? (
          <button
            onClick={() => {
              localStorage.removeItem("auth-token");
              window.location.replace("/");
            }}
          >
            Logout
          </button>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}
        <Link to="/cart">
          <img src={cart_icon} alt="" />
        </Link>
        <div className="nav-cart-count">{cartItems.length}</div>
      </div>
    </div>
  );
};

export default Navbar;
