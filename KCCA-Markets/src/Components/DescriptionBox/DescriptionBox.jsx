import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="navigator">
            <div className="nav-box">Description</div>
            <div className="nav-box-fade">Reviews (111)</div>
        </div>
        <div className="descript">
            <p>MANGU ONLINE MARKET (MOMarket) is an e-commerce platform 
              dedicated to delivering fresh groceries and related products 
              at affordable prices. Unlike a marketplace, MOMarket owns and 
              manages all its products, ensuring quality and consistency.
              With the slogan "Freshness Guaranteed,"
            </p>
        </div>
    </div>
  )
}

export default DescriptionBox