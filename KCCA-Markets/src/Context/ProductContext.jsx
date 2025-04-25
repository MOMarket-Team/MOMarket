import React, { createContext, useState, useEffect } from "react";

export const ProductContext = createContext(null);

const ProductContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [new_collection, setNew_Collection] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // This is for related products
  const getProductsByCategory = (category) => {
    if (!category) return [];
    return all_product.filter(
      (item) => item.category?.toLowerCase() === category.toLowerCase()
    );
  };

  // This is for search logic
  const searchProducts = (query) => {
    if (!query || !query.trim()) return [];
    const lowerQuery = query.toLowerCase();
  
    return all_product.filter((product) =>
      product.name.toLowerCase().includes(lowerQuery)
    );
  };  

  useEffect(() => {
    fetch("https://momarket-7ata.onrender.com/allproducts")
      .then((response) => response.json())
      .then((data) => {
        setAll_Product(data);
  
        // Equivalent of `newcollections`: last 12 products, excluding the first
        const newItems = data.slice(1).slice(-12);
        setNew_Collection(newItems);
  
        // Equivalent of `popularinfruit`: first 6 products with category "Fruits"
        const popular = data.filter((item) => item.category === "Fruits").slice(0, 6);
        setPopularProducts(popular);

      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);  

  useEffect(() => {
    const storedCartItems = localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [];

    setCartItems(storedCartItems);

    const subtotal = storedCartItems.reduce(
      (sum, item) => {
        if (item.measurement === "Set") {
          return sum + item.quantity;
        } else if (item.measurement === "Whole") {
          return sum + item.sizeOptions[item.selectedSize] * item.quantity;
        } else {
          return sum + item.price * item.quantity;
        }
      },
      0
    );
    setCartTotal(subtotal);
  }, []);

  const updateCartTotals = (items) => {
    const subtotal = items.reduce((sum, item) => {
      if (item.measurement === "Set") return sum + item.quantity;
      else if (item.measurement === "Whole") return sum + item.sizeOptions[item.selectedSize] * item.quantity;
      else return sum + item.price * item.quantity;
    }, 0);
    setCartTotal(subtotal);
  };

  const addTocart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      alert("Product already exists in the cart");
      return;
    }

    if (product.measurement === "Whole") {
      product.selectedSize = product.selectedSize || "small";
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
        if (item.measurement === "Kgs" && newQuantity < 0.5) return item;
        if (item.measurement === "Whole" && newQuantity < 1) return item;
        if (item.measurement === "Set" && newQuantity < 1000) return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setCartItems(updatedCart);
    updateCartTotals(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
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
    all_product,
    new_collection,
    popularProducts,
    cartItems,
    cartTotal,
    addTocart,
    removeFromcart,
    updateItemQuantity,
    getTotalItems: () => cartItems.length,
    getTotalCartAmount: () => cartTotal,
    clearCart,
    logout,
    getProductsByCategory,
    searchProducts,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {props.children}
    </ProductContext.Provider>
  );
};

export default ProductContextProvider;