import React, { useContext, useEffect, useState } from "react";
import "./CartItems.css";
import { ProductContext } from "../../Context/ProductContext";
import remove_icon from "../Assets/cart_cross_icon.png";
import { useNavigate } from "react-router-dom";
import prodprice from "../../../utils/priceformat";

const CartItems = () => {
  const { getTotalCartAmount, all_product, cartItems, removeFromcart } =
    useContext(ProductContext);
  const [cartItem, setCartItem] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const navigate = useNavigate();

  // Update cart items from context whenever cartItems changes
  useEffect(() => {
    const updatedCart = localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : cartItems;
    setCartItem(updatedCart);

    // Calculate cart total
    const total = updatedCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartTotal(total);
  }, [cartItems]);

  const updateCartAndTotal = (updatedCart) => {
    setCartItem(updatedCart);
    setCartTotal(
      updatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  };

  const handleRemoveFromCart = (id) => {
    const updatedCart = cartItem.filter((item) => item.id !== id);
    updateCartAndTotal(updatedCart);
    removeFromcart(id); // Update global context
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity less than 1

    const updatedCart = cartItem.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    updateCartAndTotal(updatedCart);
  };

  const handleCheckout = () => {
    navigate("/checkout");
    console.log(cartItems, "cartItems");
    console.log(all_product, "all_product");
  };

  return (
    <div className="cartitems">
      <div className="format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {cartItem.length === 0 ? (
        <h1>Cart is empty</h1>
      ) : (
        cartItem.map((e) => (
          <div key={e.id}>
            <div className="format format-main">
              <img src={e.image} alt="" className="product-icon" />
              <p>{e.name}</p>
              <p>{prodprice.format(e.price)}</p>
              <div className="quantity-control">
                {/* <button
                  onClick={() =>
                    handleQuantityChange(e.id, e.quantity - 1)
                  }
                >
                  -
                </button> */}
                <input
                  type="number"
                  className="quantity"
                  value={e.quantity}
                  onChange={(event) => {
                    const newQuantity = parseInt(event.target.value, 10);
                    handleQuantityChange(e.id, newQuantity || 1); // Default to 1 if empty
                  }}
                />
                {/* <button
                  onClick={() =>
                    handleQuantityChange(e.id, e.quantity + 1)
                  }
                >
                  +
                </button> */}
              </div>
              <p>{prodprice.format(e.price * e.quantity)}</p>
              <img
                className="remove-icon"
                src={remove_icon}
                onClick={() => handleRemoveFromCart(e.id)}
                alt=""
              />
            </div>
            <hr />
          </div>
        ))
      )}
      <div className="down">
        <div className="total">
          <h1>Cart Totals</h1>
          <div>
            <div className="total-item">
              <p>Subtotal</p>
              <p>{prodprice.format(cartTotal)}</p>
            </div>
            <hr />
            <div className="total-item">
              <p>Delivery Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="total-item">
              <h3>Total</h3>
              <h3>{prodprice.format(cartTotal)}</h3>
            </div>
          </div>
          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="promobox">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;