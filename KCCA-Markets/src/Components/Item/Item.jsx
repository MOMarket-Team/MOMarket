import React from 'react';
//import './Item.css';
import { Link } from 'react-router-dom';
import prodprice from '../../../utils/priceformat';
import eye_icon from '../Assets/eye.png';

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
        {prodprice.format(props.price)} <span className="unit"></span>
      </div>

      {/* View Details Section */}
      <Link to={`/product/${props.id}`} state={{ category: props.category }} className="view-details">
        <img src={eye_icon} alt="View Details" className="eye-icon" />
        <span>View</span>
      </Link>
    </div>
  );
};

export default Item;