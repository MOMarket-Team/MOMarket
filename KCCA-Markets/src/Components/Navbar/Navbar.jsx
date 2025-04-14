import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import { ProductContext } from "../../Context/ProductContext";

const Navbar = () => {
  const [menu, setMenu] = useState("Products");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [typingTimeout, setTypingTimeout] = useState(null); // For delaying autocomplete

  const { cartItems } = useContext(ProductContext);
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchUserName = async () => {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      try {
        const response = await fetch("https://momarket-7ata.onrender.com/getuser", {
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

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear timeout if typing is ongoing
    if (typingTimeout) clearTimeout(typingTimeout);

    // If the input is empty, clear results immediately
    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    // Set a delay of 5 seconds before triggering the search
    setTypingTimeout(
      setTimeout(async () => {
        try {
          const response = await fetch(`https://momarket-7ata.onrender.com/search?q=${value}`);
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
      }, 5000) // 5-second delay
    );
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

  // Close dropdown or search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (dropdownRef.current && !dropdownRef.current.contains(event.target)) &&
        (searchRef.current && !searchRef.current.contains(event.target))
      ) {
        setDropdownOpen(false);
        setSearchTerm(""); // Clear search input
        setSearchResults([]); // Clear search results
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="Logo" />
        <p>MANGU ONLINE MARKET</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="nav-search" ref={searchRef}>
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

        <ul className="nav-menu">
          {[
            { name: "Home", path: "/" },
            { name: "Fruits", path: "/Fruits" },
            { name: "Foods", path: "/Foods" },
            { name: "Vegetables", path: "/Vegetables" },
            { name: "Meats & Fish", path: "/Sauce" },
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
          <div className="user-dropdown" ref={dropdownRef}>
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
        {cartItems.length > 0 && <div className="nav-cart-count">{cartItems.length}</div>}
      </div>
    </div>
  );
};

export default Navbar;