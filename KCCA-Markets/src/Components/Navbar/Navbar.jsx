import React, { useContext, useRef, useState, useEffect } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { ProductContext } from '../../Context/ProductContext';
import dropdown_icon from '../Assets/dropdown_icon.png';

const Navbar = () => {
    const [menu, setMenu] = useState("Products");
    const { getTotalItems } = useContext(ProductContext);
    const [user, setUser] = useState(null); // To store user information
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const menuRef = useRef();

    useEffect(() => {
        // Fetch user information from the token
        const token = localStorage.getItem('auth-token');
        if (token) {
            // Decode token to get user info (dummy logic for this example)
            fetch('http://localhost:4000/getuser', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) setUser(data.user); // Assuming backend returns a `user` object
                })
                .catch(() => setUser(null));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth-token');
        setUser(null);
        window.location.replace('/');
    };

    const dropdownToggle = (e) => {
        menuRef.current.classList.toggle('nav-menu-visible');
        e.target.classList.toggle('open');
    };

    return (
        <div className='navbar'>
            <div className="nav-logo">
                <img src={logo} alt="Logo" />
                <p>KCCA ONLINE <br /> MARKETS</p>
            </div>
            <img className='nav-dropdown' onClick={dropdownToggle} src={dropdown_icon} alt="Dropdown Icon" />
            <ul ref={menuRef} className='nav-menu'>
                <li onClick={() => { setMenu("Products") }}>
                    <Link style={{ textDecoration: 'none' }} to='/'>Products</Link>
                    {menu === "Products" ? <hr /> : null}
                </li>
                <li onClick={() => { setMenu("Fruits") }}>
                    <Link style={{ textDecoration: 'none' }} to='/Fruits'>Fruits</Link>
                    {menu === "Fruits" ? <hr /> : null}
                </li>
                <li onClick={() => { setMenu("Foods") }}>
                    <Link style={{ textDecoration: 'none' }} to='/Foods'>Foods</Link>
                    {menu === "Foods" ? <hr /> : null}
                </li>
                <li onClick={() => { setMenu("Vegetables") }}>
                    <Link style={{ textDecoration: 'none' }} to='/Vegetables'>Vegetables</Link>
                    {menu === "Vegetables" ? <hr /> : null}
                </li>
                <li onClick={() => { setMenu("Sauce") }}>
                    <Link style={{ textDecoration: 'none' }} to='/Sauce'>Sauce</Link>
                    {menu === "Sauce" ? <hr /> : null}
                </li>
            </ul>
            <div className="nav-logo-cart">
                {user ? (
                    <div className="user-dropdown">
                        <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                            {user.name || user.email}
                        </button>
                        {dropdownOpen && (
                            <div className="dropdown-menu">
                                <p onClick={handleLogout}>Logout</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to='/login'><button>Login</button></Link>
                )}
                <Link to='/cart'><img src={cart_icon} alt="Cart Icon" /></Link>
                <div className="nav-cart-count">{getTotalItems()}</div>
            </div>
        </div>
    );
};

export default Navbar;