import React, { createContext, useState, useEffect } from "react";

export const ProductContext = createContext(null);

// const getDefacultCart = () => {
//     let cart = {};
//     for (let index = 0; index < 300; index++) {
//         cart[index] = 0;                        
//     }
//     return cart;
// }

const ProductContextProvider = (props) => {
    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        fetch('http://localhost:4000/allproducts')
            .then((response) => response.json())
            .then((data) => setAll_Product(data));

        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/cart', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
            }).then((response) => response.json())
                .then((data) => setCartItems(data));
        }
    }, []);

    const addTocart = (itemId) => {

        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/cart/add', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product: [{"product": itemId, "quantity": 1}], totalPrice:5 }),
            })
                .then((response) => response.json())
                .then((data) => console.log(data));
        }
    }

    const removeFromcart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/removefromcart', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId }),
            })
                .then((response) => response.json())
                .then((data) => console.log(data));
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = all_product.find((Product) => Product.id === Number(item));
                totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    }

    const getTotalItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalItem += cartItems[item];
            }
        }
        return totalItem;
    }

    const clearCart = () => {
        setCartItems(getDefacultCart());
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/clearcart', {
                method: 'POST',
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            })
                .then((response) => response.json())
                .then((data) => console.log(data));
        }
    }

    const contextValue = { getTotalItems, getTotalCartAmount, all_product, cartItems, addTocart, removeFromcart, clearCart };

    return (
        <ProductContext.Provider value={contextValue}>
            {props.children}
        </ProductContext.Provider>
    );
};

export default ProductContextProvider;