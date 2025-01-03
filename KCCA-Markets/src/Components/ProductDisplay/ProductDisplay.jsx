/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RelatedProducts from "../RelatedProducts/RelatedProducts";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ProductContext } from "../../Context/ProductContext";
import prodprice from "../../../utils/priceformat";

import "./ProductDisplay.css";
const ProductDisplay = (props) => {
  const location = useLocation();
  const { product } = props;
  const { addTocart } = useContext(ProductContext);
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);

  const selectedCategory = location.state?.category || product?.category;

  useEffect(() => {
    if (product?.id) {
      const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
      setQuantity(
        cartItems.find((item) => item.id === product.id)?.quantity || 1
      );
    }
  }, [product]);

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

  const increaseQuantity = () => {
    const newQuantity = quantity + 0.5;
    setQuantity(newQuantity);
    updateLocalStorageQuantity(newQuantity);
  };

  const decreaseQuantity = () => {
    if (quantity > 0.5) {
      const newQuantity = quantity - 0.5;
      setQuantity(newQuantity);
      updateLocalStorageQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addTocart({ ...product, quantity });
    setShowAlert(true); // Show the alert
    setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
  };

  if (!product) {
    return <p>Loading product details...</p>;
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="productdisplay">
      <div className="left">
        <div className="img-list">
          <img src={product.image} alt="Product Thumbnail 1" />
          <img src={product.image} alt="Product Thumbnail 2" />
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
          <div className="price">{prodprice.format(product.price)} / kg</div>
        </div>
        <div className="description">Best foods for life and strength</div>

        <div className="weight-display">
          <p className="weight_price">Selected Weight: {quantity} kg</p>
          <p className="weight_total">Total: {prodprice.format(totalPrice)}</p>
        </div>

        <div className="quantity-control">
          <span onClick={decreaseQuantity} className="span__button">
            -
          </span>
          <input
            type="number"
            className="quantity-input"
            value={quantity}
            min="0.5"
            step="0.5"
            readOnly
          />
          <span onClick={increaseQuantity} className="span__button">
            +
          </span>
        </div>

        <button onClick={handleAddToCart}>
          ADD TO CART
        </button>

        {showAlert && <div className="alert-message">Product added to Cart</div>}

        <p className="right-category">
          <span>Category :</span> {product.category}
        </p>
        <p className="right-category">
          <span>Tags :</span> Fresh and lively
        </p>
      </div>

      <RelatedProducts selectedCategory={selectedCategory} />
    </div>
  );
};

export default ProductDisplay;