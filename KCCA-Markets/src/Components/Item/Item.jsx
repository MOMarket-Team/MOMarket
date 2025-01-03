/* eslint-disable react/prop-types */

import "./Item.css";
import { Link } from "react-router-dom";
import prodprice from "../../../utils/priceformat";

const Item = (props) => {
  return (
    <div className="item">
      {/* Pass the category to the product details page */}
      <Link to={`/product/${props.id}`} state={{ category: props.category }}>
        <img onClick={() => window.scrollTo(0, 0)} src={props.image} alt="" />
      </Link>
      <p>{props.name}</p>
      <div className="prices">{prodprice.format(props.price)}</div>
    </div>
  );
};

export default Item;
