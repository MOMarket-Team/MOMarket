import "./Admin.css";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { Routes, Route } from "react-router-dom";
import AddProduct from "../../Components/AddProduct/AddProduct";
import ListProduct from "../../Components/ListProduct/ListProduct";
import Orders from "../../Components/Orders/Orders.jsx";

const Admin = () => {
  return (
    <div className="admin">
      <Sidebar />
      <Routes>
        <Route path="/addproduct" element={<AddProduct />} />
        <Route path="/Listproduct" element={<ListProduct />} />
        <Route path="/admin/orders" element={<Orders />} />
      </Routes>
    </div>
  );
};

export default Admin;
