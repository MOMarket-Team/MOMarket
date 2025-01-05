import "./Sidebar.css";
import { Link } from "react-router-dom";
import add_product_icon from "../../assets/cart_icon.png";
import product_list from "../../assets/foodlist.jpg";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link to={"/addproduct"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={add_product_icon} alt="" />
          <p>Add Product</p>
        </div>
      </Link>
      <Link to={"/Listproduct"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={product_list} alt="" className="food" />
          <p>Product List</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
