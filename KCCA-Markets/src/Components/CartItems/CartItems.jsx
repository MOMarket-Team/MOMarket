import React, { useContext } from 'react';
import './CartItems.css';
import { ProductContext } from '../../Context/ProductContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { useNavigate } from 'react-router-dom';

const CartItems = () => {
  const { getTotalCartAmount, all_product, cartItems, removeFromcart } = useContext(ProductContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className='cartitems'>
      <div className="format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>  
        <p>Remove</p>
      </div>
      <hr />
      {all_product.map((e) => {
        if (cartItems[e.id] > 0) {
          return (
            <div key={e.id}>
              <div className="format format-main">
                <img src={e.image} alt="" className='product-icon' />
                <p>{e.name}</p>
                <p>${e.price}</p>
                <button className='quantity'>{cartItems[e.id]}</button>
                <p>${e.price * cartItems[e.id]}</p>
                <img className='remove-icon' src={remove_icon} onClick={() => { removeFromcart(e.id) }} alt="" />
              </div>
              <hr />
            </div>
          );
        }
        return null;
      })}
      <div className="down">
        <div className="total">
          <h1>Cart Totals</h1>
          <div>
            <div className="total-item">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="total-item">
              <p>Delivery Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="total-item">
              <h3>Total</h3>
              <h3>${getTotalCartAmount()}</h3>
            </div>
          </div>
          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="promobox">
            <input type="text" placeholder='promo code' />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItems;
