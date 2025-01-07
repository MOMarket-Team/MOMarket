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
            <p>At Mangu Online Market (MOMarket), we battle for freshness so you 
              can enjoy it! We bring market-fresh products directly to your doorstep 
              at the actual market prices. The only extra cost? A small labor fee that 
              scales with your purchase size. Experience convenience, transparency, and 
              unmatched quality. Learn more about us today!
            </p>
        </div>
    </div>
  )
}

export default DescriptionBox