import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

import { Link, useNavigate } from "react-router-dom";

import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import dropdown_icon from "../Assets/dropdown_icon.png";
import { ProductContext } from "../../Context/ProductContext";

const Navbar = () => {
  const [menu, setMenu] = useState("Products");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("User"); // Initialize with "User"

  const { cartItems } = useContext(ProductContext);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the user's name after login
    const fetchUserName = async () => {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:4000/getuser", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success && data.user) {
          setUserName(data.user.name || "User");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserName();
  }, []);

  const navigate = useNavigate();

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle("nav-menu-visible");
    e.target.classList.toggle("open");
  };

  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {

      const response = await fetch(
        `http://localhost:4000/api/products/search?q=${e.target.value}`
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

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    window.location.replace("/");
  };

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="Logo" />
        <p>
          MANGU ONLINE <br /> MARKET
        </p>
      </div>

      <img
        className="nav-dropdown"
        onClick={dropdown_toggle}
        src={dropdown_icon}
        alt="Dropdown Icon"
      />

      <div style={{ display: "flex", flexDirection: "column" }}>
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
                    setSearchResults([]);
                    setSearchTerm("");
                  }}
                >
                  {product.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <ul ref={menuRef} className="nav-menu">
          {[
            { name: "Products", path: "/" },
            { name: "Fruits", path: "/Fruits" },
            { name: "Foods", path: "/Foods" },
            { name: "Vegetables", path: "/Vegetables" },
            { name: "Sauce", path: "/Sauce" },
            { name: "Spices", path: "/Spices" },
          ].map((item) => (
            <li key={item.name} onClick={() => setMenu(item.name)}>
              <Link style={{ textDecoration: "none" }} to={item.path}>
                {item.name}
              </Link>
              {menu === item.name && <hr />}
            </li>
          ))}
        </ul>
      </div>

      <div className="nav-logo-cart">
        {localStorage.getItem("auth-token") ? (
          <div className="user-dropdown">
              <button onClick={toggleDropdown}>{userName}</button>
              {dropdownOpen && (
                  <div className="dropdown-menu">
                      <p>
                          <Link to="/client-orders" style={{ textDecoration: "none", color: "inherit" }}>
                              Orders
                          </Link>
                      </p>
                      <p onClick={handleLogout}>Logout</p>
                      <p>Profile</p>
                  </div>
              )}
          </div>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}

        <Link to="/cart">
          <img src={cart_icon} alt="Cart" />
        </Link>
        <div className="nav-cart-count">{cartItems.length}</div>
      </div>
    </div>
  );
};

export default Navbar;
