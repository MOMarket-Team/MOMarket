import "./breadcrum.css";
import arrow_icon from "../Assets/breadcrum_arrow.png";
import product from "../../pages/Product";

const Breadcrum = () => {
  return (
    // here we still have a problem
    <div className="breadcrum">
      HOME <img src={arrow_icon} alt="" />
      PRODUCT
      {product.category} <img src={arrow_icon} alt="" />
      {product.name}
    </div>
  );
};

export default Breadcrum;
