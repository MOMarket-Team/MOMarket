import React, { useState, useEffect } from "react";
import "./Hero.css";
import groce from "../Assets/groce.webp";
import groce1 from "../Assets/grocei.webp";
import groce2 from "../Assets/groceii.webp";
import groce3 from "../Assets/groceiii.webp";
import groce4 from "../Assets/groceiv.webp";
import groce5 from "../Assets/grocev.webp";

const images = [groce, groce1, groce2, groce3, groce4, groce5];

const Hero = ({ handleManualOrder }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Function to go to the next image
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Function to go to the previous image
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero">
      <div className="hero-left">
        <h2>Shop Your Way</h2>
        <p>Order Exactly What You Need</p>
        <p>Freshness guaranteed</p>
        <button className="manual-order-btn" onClick={handleManualOrder}>
          Enter Your Order/s Manually
        </button>
      </div>
      <div className="hero-right">
        <button className="arrow left" onClick={prevImage}>&#8592;</button>
        <img src={images[currentImageIndex]} alt="Hero" />
        <button className="arrow right" onClick={nextImage}>&#8594;</button>
      </div>
    </div>
  );
};

export default Hero;