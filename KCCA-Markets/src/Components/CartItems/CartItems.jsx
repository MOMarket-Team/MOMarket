import { useContext, useState } from "react";
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
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const GOOGLE_MAPS_API_KEY = "AIzaSyCwf2lc3JC4jjSBztY4MB78cRzZAKZPGOQ"; // Replace with your API key

  // Nakasero Market coordinates
  const companyLocation = { lat: 0.3175, lng: 32.5825 };

  const calculateDeliveryFee = async (location) => {
    if (!location.trim()) return;

    const loader = new Loader({ apiKey: GOOGLE_MAPS_API_KEY, version: "weekly" });

    try {
      const google = await loader.load();
      const geocoder = new google.maps.Geocoder();

      // Convert user location to coordinates
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === "OK" && results[0]) {
          const userCoords = results[0].geometry.location;

          // Use Distance Matrix API to calculate distance
          const service = new google.maps.DistanceMatrixService();
          service.getDistanceMatrix(
            {
              origins: [companyLocation],
              destinations: [userCoords],
              travelMode: "DRIVING",
            },
            (response, status) => {
              if (status === "OK") {
                const distanceInKm =
                  response.rows[0].elements[0].distance.value / 1000; // Convert meters to KM
                const fee = distanceInKm * 1000; // UGX per KM
                setDeliveryFee(fee);
              } else {
                console.error("Error fetching distance:", status);
              }
            }
          );
        } else {
          alert("Invalid location. Please enter a correct address.");
        }
      });
    } catch (error) {
      console.error("Google Maps API error:", error);
    }
  };

  const handleLocationChange = (e) => {
    const location = e.target.value;
    setDeliveryLocation(location);
    calculateDeliveryFee(location);
  };

  const finalTotal = getTotalCartAmount() + (deliveryOption === "deliver" ? deliveryFee : 0);

  return (
    <div className="cartitems">
      <div className="format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price per kg</p>
        <p>Weight (kg)</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
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
                      value={deliveryLocation}
                      onChange={handleLocationChange}
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
        <div className="promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="promobox">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;