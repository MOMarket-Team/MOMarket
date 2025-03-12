import React, { useContext, useEffect, useState } from "react";
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
  const [selectedSize, setSelectedSize] = useState("small"); // For "Whole" products

  const selectedCategory = location.state?.category || product?.category;

  useEffect(() => {
    if (product?._id) {
      const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
      setQuantity(cartItems.find((item) => item._id === product._id)?.quantity || 1);
      console.log("Selected Product:", product);
    }
  }, [product]);

  // Initialize quantity to basePrice for "Set" products
  useEffect(() => {
    if (product?.measurement === "Set") {
      setQuantity(product.basePrice || 0); // Start with basePrice for "Set"
    }
  }, [product]);

  const updateLocalStorageQuantity = (newQuantity) => {
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const updatedCartItems = cartItems.map((item) =>
      item._id === product._id ? { ...item, quantity: newQuantity } : item
    );
    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
  };

  const increaseQuantity = () => {
    let newQuantity = quantity;
    if (product.measurement === "Kgs") {
      newQuantity += 0.5;
    } else if (product.measurement === "Whole") {
      newQuantity += 1;
    } else if (product.measurement === "Set") {
      newQuantity += 1000; // Increment by 1000 for "Set"
    }
    setQuantity(newQuantity);
    updateLocalStorageQuantity(newQuantity);
  };

  const decreaseQuantity = () => {
    let newQuantity = quantity;
    if (product.measurement === "Kgs" && quantity > 0.5) {
      newQuantity -= 0.5;
    } else if (product.measurement === "Whole" && quantity > 1) {
      newQuantity -= 1;
    } else if (product.measurement === "Set" && quantity > product.basePrice) {
      newQuantity -= 1000; // Decrement by 1000 for "Set", but not below basePrice
    }
    setQuantity(newQuantity);
    updateLocalStorageQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    const productToAdd = { ...product, quantity, selectedSize };
    console.log("Adding to cart:", productToAdd); // Log the product being added
    addTocart(productToAdd);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  if (!product) {
    return <p>Loading product details...</p>;
  }

  // Calculate total price based on measurement type
  const totalPrice =
    product.measurement === "Whole"
      ? product.sizeOptions[selectedSize] * quantity
      : product.measurement === "Set"
      ? quantity // For "Set", total price is the current quantity (basePrice + increments)
      : product.price * quantity;

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
          <div className="price">
            {product.measurement === "Whole"
              ? `${prodprice.format(product.sizeOptions[selectedSize])}`
              : product.measurement === "Set"
              ? `${prodprice.format(product.basePrice)}+` // Display basePrice for "Set"
              : `${prodprice.format(product.price)} ${product.measurement === "Kgs" ? "/ kg" : ""}`}
          </div>
        </div>
        <div className="description">Best foods for life and strength</div>

        {product.measurement === "Whole" && (
          <div className="size-options">
            <p>Pick size:</p>
            <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="big">Big</option>
            </select>
          </div>
        )}

        <div className="weight-display">
          <p className="weight_price">
            {product.measurement === "Kgs"
              ? `Selected Weight: ${quantity} kg`
              : product.measurement === "Whole"
              ? `Selected Quantity: ${quantity}`
              : `Products From: ${prodprice.format(product.basePrice)} +..`} {/* Display basePrice for "Set" */}
          </p>
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
            min={product.measurement === "Kgs" ? 0.5 : product.measurement === "Set" ? product.basePrice : 1}
            step={product.measurement === "Kgs" ? 0.5 : 1}
            readOnly
          />
          <span onClick={increaseQuantity} className="span__button">
            +
          </span>
        </div>

        <button onClick={handleAddToCart}>ADD TO CART</button>

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