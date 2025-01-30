import React from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import prodprice from '../../../utils/priceformat';

const Item = (props) => {
  return (
    <div className='item'>
      {/* Link for the image */}
      <Link to={`/product/${props.id}`} state={{ category: props.category }}>
        <img onClick={() => window.scrollTo(0, 0)} src={props.image} alt={props.name} />
      </Link>
      
      {/* Link for the product name */}
      <Link to={`/product/${props.id}`} state={{ category: props.category }} className="item-name">
        <p>{props.name}</p>
      </Link>
      
      {/* Price with /KG */}
      <div className="item-price">
        {prodprice.format(props.price)} <span className="unit">/KG</span>
      </div>
    </div>
  );
};

export default Item;