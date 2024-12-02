import React, { createContext, useState, useEffect } from "react";

export const ProductContext = createContext(null);


const ProductContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState([

  ]);

  useEffect(() => {
    // Fetch all products
    fetch("http://localhost:4000/allproducts")
      .then((response) => response.json())
      .then((data) => setAll_Product(data));

    // Fetch cart from backend if user is logged in
    // if (localStorage.getItem("auth-token")) {
    //   fetch("http://localhost:4000/getcart", {
    //     method: "POST",
    //     headers: {
    //       Accept: "application/json",
    //       "auth-token": localStorage.getItem("auth-token"),
    //       "Content-Type": "application/json",
    //     },
    //   })
    //     .then((response) => response.json())
    //     .then((data) => {
    //       setCartItems(data);
    //       localStorage.setItem("cartItems", JSON.stringify(data));
    //     });
    // }
  }, []);

  // useEffect(() => {
  //   // Save cart to localStorage whenever it changes
  //   localStorage.setItem("cartItems", JSON.stringify(cartItems));
  // }, [cartItems]);

  const addTocart = (product) => {
    const itemId = product.id;
    const localCart = localStorage.getItem('cartItems')

    const existingItem = cartItems.find((item) => item.id === product.id);

    // Check if product exists in local storage
    


    if (existingItem) {
        alert('product already exists')
      return;
    }

    // Add quantity to product
    product.quantity = 1;

    setCartItems([...cartItems, product]);

    // Add to local storage
    localStorage.setItem("cartItems", JSON.stringify([...cartItems, product]));

  };

  const removeFromcart = (itemId) => {

    setCartItems(cartItems.filter((item) => item.id !== itemId));

    if (localStorage.getItem("auth-token")) {
      fetch("http://localhost:4000/removefromcart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": localStorage.getItem("auth-token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      }).then((response) => response.json());
    }
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
    const defaultCart = getDefaultCart();
    setCartItems(defaultCart);

    if (localStorage.getItem("auth-token")) {
      fetch("http://localhost:4000/clearcart", {
        method: "POST",
        headers: {
          "auth-token": localStorage.getItem("auth-token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }).then((response) => response.json());
    }

    localStorage.setItem("cartItems", JSON.stringify(defaultCart));
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
