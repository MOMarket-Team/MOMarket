import React, { useContext, useEffect, useState } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ProductContext } from "../../Context/ProductContext";
import prodprice from "../../../utils/priceformat";

const ProductDisplay = (props) => {
  const { product } = props;
  const { addTocart } = useContext(ProductContext);
  const [quantity, setQuantity] = useState(1); // Initial quantity

  // Fetch quantity from localStorage
  useEffect(() => {
    if (product?.id) {
      const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
      setQuantity(cartItems.find((item) => item.id === product.id)?.quantity || 1);
    }
  }, [product]);

  // Helper to update localStorage
  const updateLocalStorageQuantity = (newQuantity) => {
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const updatedCartItems = cartItems.map((item) => {
      if (item.id === product.id) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
  };

  // Handlers for quantity changes
  const increaseQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    updateLocalStorageQuantity(newQuantity);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      updateLocalStorageQuantity(newQuantity);
    }
  };
  
  // Handle undefined product gracefully
  if (!product) {
    return (
      <div className="productdisplay">
        <p>Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="productdisplay">
      <div className="left">
        <div className="img-list">
          <img src={product.image} alt="Product Thumbnail 1" />
          <img src={product.image} alt="Product Thumbnail 2" />
          {/* <img src={product.image} alt="Product Thumbnail 3" />
          <img src={product.image} alt="Product Thumbnail 4" /> */}
        </div>
        <div className="display-img">
          <img className="main-img" src={product.image} alt="Product" />
        </div>
      </div>
      <div className="right">
        <h1>{product.name}</h1>
        <div className="right-star">
          <img src={star_icon} alt="Star Rating 1" />
          <img src={star_icon} alt="Star Rating 2" />
          <img src={star_icon} alt="Star Rating 3" />
          <img src={star_icon} alt="Star Rating 4" />
          <img src={star_dull_icon} alt="Star Rating 5" />
          <p>(111)</p>
        </div>
        <div className="right-prices">
          <div className="price">{prodprice.format(product.price)}</div>
        </div>
        <div className="description">Best foods for life and strength</div>

        {/* Quantity Controls */}
        <div className="quantity-control">
          <span onClick={decreaseQuantity} className="span__button">
            -
          </span>
          <input
            type="number"
            className="quantity-input"
            value={quantity}
            readOnly
          />
          <span onClick={increaseQuantity} className="span__button">
            +
          </span>
        </div>

        {/* Add to Cart Button */}
        <button onClick={() => addTocart({ ...product, quantity })}>
          ADD TO CART
        </button>

        <p className="right-category">
          <span>Category :</span> Fruits, for life
        </p>
        <p className="right-category">
          <span>Tags :</span> Fresh and lively
        </p>
      </div>
    </div>
  );
};

export default ProductDisplay;
