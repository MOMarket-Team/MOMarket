import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'
import prodprice from '../../../utils/priceformat'

const Item = (props) => {
  return (
    <div className='item'>
      {/* this is to get the product id */}
        <Link to={`/product/${props.id}`}>
        <img onClick={window.scrollTo(0,0)} src={props.image} alt="" /></Link>
        <p>{props.name}</p>
        <div className="prices">
            {prodprice.format(props.price)}
        </div>
    </div>
  )
}

export default Item
