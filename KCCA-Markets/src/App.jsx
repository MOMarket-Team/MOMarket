import React from "react";
import Navbar from "./Components/Navbar/Navbar.jsx";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Products from "./pages/Products.jsx";
import ProductsCategory from "./pages/ProductsCategory.jsx";
import Product from "./pages/Product.jsx";
import Cart from "./pages/Cart.jsx";
import LoginSignup from "./pages/LoginSignup.jsx";
import Footer from "./Components/Footer/Footer.jsx";
// these are for the banners 
import fruit_banner from './Components/Assets/Fruits_banner.jpg'
import food_banner from './Components/Assets/Foods_banner.jpg'
import veg_banner from './Components/Assets/vegetable_banner.jpg'
import sauce_banner from './Components/Assets/Meat_banner.jpg'
import spice_banner from './Components/Assets/Spices_banner.jpg'
import Checkout from "./pages/Checkout.jsx";
import SearchResults from "./pages/SearchResults.jsx";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Products />} />
          <Route path='/Fruits' element={<ProductsCategory banner={fruit_banner} category="Fruits" />} />
          <Route path='/Foods' element={<ProductsCategory banner={food_banner} category="Foods" />} />
          <Route path='/Vegetables' element={<ProductsCategory banner={veg_banner} category="Vegetables" />} />
          <Route path='/Sauce' element={<ProductsCategory banner={sauce_banner} category="Sauce" />} />
          <Route path='/Spices' element={<ProductsCategory banner={spice_banner} category="Spices" />} />
          <Route path="/Product" element={<Product />}>
            <Route path=':productId' element={<Product />} />
          </Route>
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<LoginSignup />} />
          <Route path='/checkout' element={<Checkout/>} />
          <Route path='/search' element={<SearchResults/>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;