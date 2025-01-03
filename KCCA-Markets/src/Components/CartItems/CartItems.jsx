import { useContext, useEffect, useState } from "react";
import "./CartItems.css";
import { ProductContext } from "../../Context/ProductContext";
import remove_icon from "../Assets/cart_cross_icon.png";
import { useNavigate } from "react-router-dom";
import prodprice from "../../../utils/priceformat";

const CartItems = () => {
  const { all_product, cartItems, removeFromcart } = useContext(ProductContext);
  const [cartItem, setCartItem] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [laborFee, setLaborFee] = useState(0);
  const navigate = useNavigate();

  const calculateLaborFee = (total) => {
    if (total > 20000) {
      return 20000;
    } else if (total > 10000) {
      return 10000;
    }
    return 0;
  };

  useEffect(() => {
    const updatedCart = localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : cartItems;
    setCartItem(updatedCart);

    const total = updatedCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartTotal(total);
    setLaborFee(calculateLaborFee(total));
  }, [cartItems]);

  const updateCartAndTotal = (updatedCart) => {
    const subtotal = updatedCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartItem(updatedCart);
    setCartTotal(subtotal);
    setLaborFee(calculateLaborFee(subtotal));
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  };

  const handleRemoveFromCart = (id) => {
    const updatedCart = cartItem.filter((item) => item.id !== id);
    updateCartAndTotal(updatedCart);
    removeFromcart(id);
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 0.5) return; // Prevent quantity less than 0.5 kg

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

  const finalTotal = cartTotal + laborFee;

  return (
    <div className="cartitems">
      <div className="format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price per kg</p>
        <p>Weight (kg)</p>
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
                <input
                  type="number"
                  className="quantity"
                  value={e.quantity}
                  min="0.5"
                  step="0.5"
                  onChange={(event) => {
                    const newQuantity = parseFloat(event.target.value) || 0.5;
                    handleQuantityChange(e.id, Math.max(0.5, newQuantity));
                  }}
                  style={{ width: "70px" }}
                />
                <span>kg</span>
              </div>
              <p>{prodprice.format(e.price * e.quantity)}</p>
              <img
                className="remove-icon"
                src={remove_icon}
                onClick={() => handleRemoveFromCart(e.id)}
                alt=""
              />
            </div>
            <div className="weight-price-info">
              <p>
                {e.quantity} kg × {prodprice.format(e.price)}/kg ={" "}
                {prodprice.format(e.price * e.quantity)}
              </p>
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
              <p>Labor Fee</p>
              <p>{prodprice.format(laborFee)}</p>
            </div>
            <hr />
            <div className="total-item">
              <h3>Total</h3>
              <h3>{prodprice.format(finalTotal)}</h3>
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
