import React, { createContext, useState, useEffect } from "react";

export const ProductContext = createContext(null);

const ProductContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [laborFee, setLaborFee] = useState(0);

  const calculateLaborFee = (total) => {
    if (total <= 25000) {
      return 7000;
    } else if (total <= 50000) {
      return 10000;
    } else if (total <= 70000) {
      return 13000;
    } else if (total <= 100000) {
      return 16000;
    } else if (total <= 150000) {
      return 20000;
    } else if (total <= 200000) {
      return 25000;
    } else {
      return 35000; // For total > 200000
    }
  };

  useEffect(() => {
    // Fetch all products
    fetch("https://momarket-7ata.onrender.com/allproducts")
      .then((response) => response.json())
      .then((data) => setAll_Product(data));
  }, []);

  // Get cartItems from localstorage and calculate totals
  useEffect(() => {
    const storedCartItems = localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [];

    setCartItems(storedCartItems);

    const subtotal = storedCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartTotal(subtotal);
    setLaborFee(calculateLaborFee(subtotal));
  }, []);

  const updateCartTotals = (items) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartTotal(subtotal);
    setLaborFee(calculateLaborFee(subtotal));
  };

  const addTocart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      alert("product already exists");
      return;
    }

    const updatedCart = [...cartItems, product];
    setCartItems(updatedCart);
    updateCartTotals(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  };

  const removeFromcart = async (itemId) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
    updateCartTotals(updatedCart);
    await localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 0.5) return; // Prevent quantity less than 0.5 kg

    const updatedCart = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    updateCartTotals(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  };

  console.log(cartItems, cartTotal, laborFee, "context");

  const getTotalCartAmount = () => {
    return cartTotal + laborFee;
  };

  const getTotalItems = () => {
    return cartItems.length;
  };

  const clearCart = () => {
    setCartItems([]);
    setCartTotal(0);
    setLaborFee(0);
    localStorage.removeItem("cartItems");
  };

  const logout = () => {
    clearCart();
    localStorage.removeItem("auth-token");
  };

  const contextValue = {
    getTotalItems,
    getTotalCartAmount,
    all_product,
    cartItems,
    cartTotal,
    laborFee,
    addTocart,
    removeFromcart,
    updateItemQuantity,
    clearCart,
    logout,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {props.children}
    </ProductContext.Provider>
  );
};

export default ProductContextProvider;
