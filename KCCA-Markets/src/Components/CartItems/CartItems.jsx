import { useContext } from "react";
import "./CartItems.css";
import { ProductContext } from "../../Context/ProductContext";
import remove_icon from "../Assets/cart_cross_icon.png";
import { useNavigate } from "react-router-dom";
import prodprice from "../../../utils/priceformat";

const CartItems = () => {
  const {
    cartItems,
    removeFromcart,
    updateItemQuantity,
    cartTotal,
    laborFee,
    getTotalCartAmount,
  } = useContext(ProductContext);
  const navigate = useNavigate();

  const handleRemoveFromCart = (id) => {
    removeFromcart(id);
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 0.5) return; // Prevent quantity less than 0.5 kg
    updateItemQuantity(id, newQuantity);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const finalTotal = getTotalCartAmount();

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
      {cartItems.length === 0 ? (
        <h1>Cart is empty</h1>
      ) : (
        cartItems.map((e) => (
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
              <p>
                Calculated based on distance
                <span className="tooltip">
                  <i className="info-icon">ℹ️</i>
                  <span className="tooltip-text">
                    Delivery fee is calculated based on your distance and is
                    payable by you at checkout.
                  </span>
                </span>
              </p>
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
