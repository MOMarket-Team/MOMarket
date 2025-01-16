import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about">
      <h1>About MANGU ONLINE MARKET</h1>
      <p>
        At <b>MANGU ONLINE MARKET</b>, our mission is to bring the freshest groceries and
        local cooking materials directly to your doorstep. Our slogan, "<b>We battle for
        freshness, you enjoy</b>," reflects our commitment to sourcing high-quality, fresh
        produce and products.
      </p>
      <p>
        We specialize in groceries and local food categories including:
      </p>
      <ul>
        <li>Fruits</li>
        <li>Vegetables</li>
        <li>Foods</li>
        <li>Sauces</li>
        <li>Spices</li>
        <li>Usables</li>
      </ul>
      <p>
        MANGU ONLINE MARKET offers real-time market prices, and we charge a labor fee
        based on your total order value. Our labor fees are:
      </p>
      <ul>
        <li>Below 20,000 UGX: 7,000 UGX</li>
        <li>20,000 - 50,000 UGX: 12,000 UGX</li>
        <li>50,000 - 70,000 UGX: 15,000 UGX</li>
        <li>70,000 - 100,000 UGX: 20,000 UGX</li>
        <li>100,000 - 150,000 UGX: 25,000 UGX</li>
        <li>Above 150,000 UGX: 30,000 UGX</li>
      </ul>
      <p>
        Delivery fees depend on your distance, and we currently accept payments through
        <b> cash on delivery</b> and <b>mobile money</b> via Flutterwave. Thank you for
        choosing MANGU ONLINE MARKET!
      </p>
    </div>
  );
};

export default About;