import Navbar from "./Components/Navbar/Navbar.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./pages/Products.jsx";
import ProductsCategory from "./pages/ProductsCategory.jsx";
import Product from "./pages/Product.jsx";
import Cart from "./pages/Cart.jsx";
import LoginSignup from "./pages/LoginSignup.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import fruit_banner from "./Components/Assets/fruit.jpg";
import food_banner from "./Components/Assets/food.jpg";
import veg_banner from "./Components/Assets/veg.jpg";
import sauce_banner from "./Components/Assets/Meat_banner.jpg";
import spice_banner from "./Components/Assets/spices.jpg";
import Checkout from "./pages/Checkout.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import ClientOrders from "./Components/ClientOrders/ClientOrders.jsx";
import About from "./Components/About/About.jsx";
import AllProducts from "./Components/AllProducts/AllProducts.jsx";
import ManualOrder from "./pages/ManualOrder.jsx";
import Hero from "./Components/Hero/Hero.jsx";

function App() {
  const handleManualOrder = () => {
    // Redirect to the manual order page
    window.location.href = "/manual-order"; // Navigate to the manual-order page
  };

  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero handleManualOrder={handleManualOrder} />
                <Products />
              </>
            }
          />
          <Route
            path="/Fruits"
            element={
              <ProductsCategory banner={fruit_banner} category="Fruits" />
            }
          />
          <Route
            path="/Foods"
            element={<ProductsCategory banner={food_banner} category="Foods" />}
          />
          <Route
            path="/Vegetables"
            element={
              <ProductsCategory banner={veg_banner} category="Vegetables" />
            }
          />
          <Route
            path="/Sauce"
            element={
              <ProductsCategory banner={sauce_banner} category="Sauce" />
            }
          />
          <Route
            path="/Spices"
            element={
              <ProductsCategory banner={spice_banner} category="Spices" />
            }
          />
          <Route path="/Product" element={<Product />}>
            <Route path=":productId" element={<Product />} />
          </Route>
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/client-orders" element={<ClientOrders />} />
          <Route path="/about" element={<About />} />
          <Route path="/AllProducts" element={<AllProducts />} />
          <Route path="/manual-order" element={<ManualOrder />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
