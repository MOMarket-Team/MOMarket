import React, { createContext, useState, useEffect } from "react";

export const ProductContext = createContext(null);

const ProductContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

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
  }, []);

  const updateCartTotals = (items) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartTotal(subtotal);
  };

  const addTocart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      alert("Product already exists in the cart");
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
    const updatedCart = cartItems.map((item) => {
      if (item.id === itemId) {
        if (item.measurement === "Kgs" && newQuantity < 0.5) return item; // Prevent quantity less than 0.5 kg
        if (item.measurement === "Whole" && newQuantity < 1) return item; // Prevent quantity less than 1 for Whole
        if (item.measurement === "Set" && newQuantity < 1000) return item; // Prevent quantity less than 1000 for Set
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setCartItems(updatedCart);
    updateCartTotals(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  };

  const getTotalCartAmount = () => {
    return cartTotal;
  };

  const getTotalItems = () => {
    return cartItems.length;
  };

  const clearCart = () => {
    setCartItems([]);
    setCartTotal(0);
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