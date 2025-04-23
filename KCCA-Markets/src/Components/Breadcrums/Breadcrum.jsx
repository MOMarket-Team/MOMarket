import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './breadcrum.css';
import arrow_icon from '../Assets/breadcrum_arrow.png';

const Breadcrum = ({ product }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const category = location.state?.category || product?.category || '';

  return (
    <div className='breadcrum'>
      <Link to="/">HOME</Link>
      <img src={arrow_icon} alt="" />
      
      {pathSegments[0] === 'product' ? (
        <>
          <Link to={`/${category.toLowerCase()}`}>{category}</Link>
          <img src={arrow_icon} alt="" />
          <span>{product?.name}</span>
        </>
      ) : (
        <span>{category || pathSegments[0]}</span>
      )}
    </div>
  );
};

export default Breadcrum;