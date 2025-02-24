import { useContext, useState, useEffect, useRef } from "react";
import "./CartItems.css";
import { ProductContext } from "../../Context/ProductContext";
import remove_icon from "../Assets/cart_cross_icon.png";
import { useNavigate } from "react-router-dom";
import prodprice from "../../../utils/priceformat";
import { Loader } from "@googlemaps/js-api-loader";

const CartItems = () => {
  const {
    cartItems,
    removeFromcart,
    updateItemQuantity,
    cartTotal,
    getTotalCartAmount,
  } = useContext(ProductContext);
  const navigate = useNavigate();

  const [deliveryOption, setDeliveryOption] = useState("pickup");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const inputRef = useRef(null);

  const GOOGLE_MAPS_API_KEY = "AIzaSyCwf2lc3JC4jjSBztY4MB78cRzZAKZPGOQ"; // Replace with your API key

  // Nakasero Market coordinates
  const companyLocation = { lat: 0.3175, lng: 32.5825 };

  const [googleMaps, setGoogleMaps] = useState(null);

useEffect(() => {
  const loader = new Loader({
    apiKey: GOOGLE_MAPS_API_KEY,
    version: "weekly",
    libraries: ["places"],
  });

  loader.load().then((google) => {
    setGoogleMaps(google);
    console.log("Google Maps API loaded successfully");

    if (inputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "UG" },
        fields: ["formatted_address", "geometry"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          setDeliveryLocation(place.formatted_address);
          calculateDeliveryFee(place.geometry.location);
        } else {
          console.error("No geometry found for the selected place");
        }
      });
    }
  }).catch((error) => {
    console.error("Error loading Google Maps API:", error);
  });
}, []);  // Runs once on component mount

const calculateDeliveryFee = (userCoords) => {
  if (!googleMaps) return; // Ensure Google Maps is loaded

  const service = new googleMaps.maps.DistanceMatrixService();

  service.getDistanceMatrix(
    {
      origins: [companyLocation],
      destinations: [{ lat: userCoords.lat(), lng: userCoords.lng() }],
      travelMode: "DRIVING",
    },
    (response, status) => {
      if (status === "OK") {
        console.log("Distance Matrix Response:", response);

        const distanceInKm = response.rows[0].elements[0].distance.value / 1000;
        const fee = distanceInKm * 1000;
        setDeliveryFee(fee);
      } else {
        console.error("Error fetching distance:", status);
      }
    }
  );
};

  const finalTotal = getTotalCartAmount() + (deliveryOption === "deliver" ? deliveryFee : 0);

  return (
    <div className="cartitems">
      {/* Cart Header */}
      <div className="format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price per kg</p>
        <p>Weight (kg)</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <h1>Cart is empty</h1>
      ) : (
        cartItems.map((e) => (
          <div key={e.id}>
            <div className="format format-main">
              <img src={e.image} alt="" className="product-icon" />
              <p>{e.name}</p>
              <p>{prodprice.format(e.price)}</p>
              <div className="quantity-control">
                <input
                  type="number"
                  className="quantity"
                  value={e.quantity}
                  min="0.5"
                  step="0.5"
                  onChange={(event) => {
                    const newQuantity = parseFloat(event.target.value) || 0.5;
                    updateItemQuantity(e.id, Math.max(0.5, newQuantity));
                  }}
                  style={{ width: "70px" }}
                />
                <span>kg</span>
              </div>
              <p>{prodprice.format(e.price * e.quantity)}</p>
              <img
                className="remove-icon"
                src={remove_icon}
                onClick={() => removeFromcart(e.id)}
                alt=""
              />
            </div>
            <hr />
          </div>
        ))
      )}

      {/* Cart Totals */}
      <div className="down">
        <div className="total">
          <h1>Cart Totals</h1>
          <div>
            <div className="total-item">
              <p>Subtotal</p>
              <p>{prodprice.format(cartTotal)}</p>
            </div>
            <hr />
            <div className="total-item">
              <p>Delivery Option</p>
              <select
                value={deliveryOption}
                onChange={(e) => setDeliveryOption(e.target.value)}
              >
                <option value="pickup">Pickup (No Delivery Fee)</option>
                <option value="deliver">Deliver</option>
              </select>
            </div>

            {deliveryOption === "deliver" && (
              <>
                <hr />
                <div className="total-item">
                  <p>Delivery Fee</p>
                  <div className="delivery-input">
                    <input
                      type="text"
                      placeholder="Enter your delivery location"
                      ref={inputRef}
                    />
                    <span>{prodprice.format(deliveryFee)}</span>
                  </div>
                </div>
              </>
            )}

            <hr />
            <div className="total-item">
              <h3>Total</h3>
              <h3>{prodprice.format(finalTotal)}</h3>
            </div>
          </div>
          <button onClick={() => navigate("/checkout")}>PROCEED TO CHECKOUT</button>
        </div>
      </div>
    </div>
  );
};

export default CartItems;