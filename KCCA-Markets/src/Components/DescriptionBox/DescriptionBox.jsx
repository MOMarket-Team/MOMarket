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
            <p>An e-commerce website for Kampala Capital City Authority(KCCA) that facilitates the selling and 
                buying of goods from within kampala markets to the people
            </p>
        </div>
    </div>
  )
}

export default DescriptionBox