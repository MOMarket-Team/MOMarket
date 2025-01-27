import React from "react";
import "./Hero.css";
import hero_image from "../Assets/hero_image.png";

const Hero = ({ handleManualOrder }) => {
  return (
    <div className="hero">
      <div className="hero-left">
        <h2>Shop Your Way</h2>
        <p>Order Exactly What You Need</p>
        <p>Hassle-Free Shopping</p>
        <button className="manual-order-btn" onClick={handleManualOrder}>
          Enter Your Order/s Manually
        </button>
      </div>
      <div className="hero-right">
        <img src={hero_image} alt="Hero" />
      </div>
    </div>
  );
};

export default Hero;