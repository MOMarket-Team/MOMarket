import React, { useState, useEffect } from "react";
import "./Hero.css";
import hero_image from "../Assets/hero_image.png";
import groce from "../Assets/groce.jpeg";
import groce1 from "../Assets/groce1.jpg";
import groce2 from "../Assets/groce2.jpeg";

const images = [hero_image, groce, groce1, groce2];

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
        <p>Hassle-Free Shopping</p>
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