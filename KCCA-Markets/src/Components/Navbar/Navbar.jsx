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
  const [typingTimeout, setTypingTimeout] = useState(null);

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

    if (typingTimeout) clearTimeout(typingTimeout);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

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
      }, 500)
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (dropdownRef.current && !dropdownRef.current.contains(event.target)) &&
        (searchRef.current && !searchRef.current.contains(event.target))
      ) {
        setDropdownOpen(false);
        setSearchTerm("");
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="nav-logo">
            <img src={logo} alt="Mangu Online Market Logo" />
            <span>MANGU ONLINE MARKET</span>
          </Link>
        </div>

        <div className="navbar-search-menu">
          <div className="nav-search-container" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Search fresh groceries..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <i className="fas fa-search"></i>
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((product) => (
                  <Link
                    to={`/product/${product.id}`}
                    key={product.id}
                    className="search-result-item"
                    onClick={() => {
                      setSearchResults([]);
                      setSearchTerm("");
                    }}
                  >
                    <span className="product-name">{product.name}</span>
                    <span className="product-category">{product.category}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <nav className="nav-menu-container">
            <ul className="nav-menu">
              {[
                { name: "Home", path: "/" },
                { name: "Fruits", path: "/Fruits" },
                { name: "Foods", path: "/Foods" },
                { name: "Vegetables", path: "/Vegetables" },
                { name: "Meats & Fish", path: "/Sauce" },
                { name: "Spices", path: "/Spices" },
              ].map((item) => (
                <li key={item.name} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${menu === item.name ? "active" : ""}`}
                    onClick={() => setMenu(item.name)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="navbar-actions">
          {localStorage.getItem("auth-token") ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <button className="user-button" onClick={toggleDropdown}>
                <span className="user-greeting">Hi, {userName}</span>
                <i className={`fas fa-chevron-${dropdownOpen ? "up" : "down"}`}></i>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/client-orders" className="dropdown-item">
                    <i className="fas fa-box"></i> My Orders
                  </Link>
                  <Link to="/profile" className="dropdown-item">
                    <i className="fas fa-user"></i> Profile
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-button">
              <button>Sign In</button>
            </Link>
          )}

          <Link to="/cart" className="cart-button">
            <img src={cart_icon} alt="Shopping Cart" />
            {cartItems.length > 0 && (
              <span className="cart-badge">{cartItems.length}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;