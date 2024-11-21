import React, { createContext, useState, useEffect } from "react";

export const ProductContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300; index++) {
        cart[index] = 0;
    }
    return cart;
};

const ProductContextProvider = (props) => {
    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState(() => {
        const storedCart = localStorage.getItem("cartItems");
        return storedCart ? JSON.parse(storedCart) : getDefaultCart();
    });

    useEffect(() => {
        // Fetch all products
        fetch("http://localhost:4000/allproducts")
            .then((response) => response.json())
            .then((data) => setAll_Product(data));

        // Fetch cart from backend if user is logged in
        if (localStorage.getItem("auth-token")) {
            fetch("http://localhost:4000/getcart", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "auth-token": localStorage.getItem("auth-token"),
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    setCartItems(data);
                    localStorage.setItem("cartItems", JSON.stringify(data));
                });
        }
    }, []);

    useEffect(() => {
        // Save cart to localStorage whenever it changes
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    const addTocart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));

        if (localStorage.getItem("auth-token")) {
            fetch("http://localhost:4000/addtocart", {
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

    const removeFromcart = (itemId) => {
        setCartItems((prev) => {
            const updatedCart = { ...prev, [itemId]: prev[itemId] - 1 };
            if (updatedCart[itemId] <= 0) delete updatedCart[itemId];
            return updatedCart;
        });

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
            if (cartItems[item] > 0) {
                let itemInfo = all_product.find(
                    (Product) => Product.id === Number(item)
                );
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
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
