import React, { createContext, useState, useEffect } from "react";

export const ProductContext = createContext(null);

const ProductContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Fetch all products
    fetch("http://localhost:4000/allproducts")
      .then((response) => response.json())
      .then((data) => setAll_Product(data));
  }, []);

  // Get cartItems from localstorage
  useEffect(() => {
    if (localStorage.getItem("cartItems")) {
      setCartItems(JSON.parse(localStorage.getItem("cartItems")));
    }
  }, []);


  const addTocart = (product) => {

    const existingItem = cartItems.find((item) => item.id === product.id);

    // Check if product exists in local storage

    if (existingItem) {
      alert("product already exists");
      return;
    }

    // Add quantity to product
    product.quantity = 1;

    setCartItems([...cartItems, product]);

    console.log(cartItems, "cartItems");
    

    // Add to local storage
    localStorage.setItem("cartItems", JSON.stringify([...cartItems, product]));
  };

  const removeFromcart = async (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));

    await localStorage.setItem(
      "cartItems",
      JSON.stringify(cartItems.filter((item) => item.id !== itemId))
    );
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItems) {
      totalAmount += cartItems[item].price * cartItems[item].quantity;
    }

    return totalAmount;
  };

  const getTotalItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      totalItem += cartItems[item];
    }
    return totalItem;
  };

  const clearCart = () => {
  //  Remove everything from cart and local storage
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  const logout = () => {
    // Clear the cart and remove the auth-token
    clearCart();
    localStorage.removeItem("auth-token");
  };

  const contextValue = {
    getTotalItems,
    getTotalCartAmount,
    all_product,
    cartItems,
    addTocart,
    removeFromcart,
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
