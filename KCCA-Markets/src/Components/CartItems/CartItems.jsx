import { useContext, useState, useEffect, useRef, useMemo } from "react";
import "./CartItems.css";
import { ProductContext } from "../../Context/ProductContext";
import remove_icon from "../Assets/cart_cross_icon.png";
import { useNavigate } from "react-router-dom";
import prodprice from "../../../utils/priceformat";
import { Loader } from "@googlemaps/js-api-loader";
import { debounce } from "lodash";

const CartItems = () => {
  const {
    cartItems,
    removeFromcart,
    updateItemQuantity,
    cartTotal,
    getTotalCartAmount,
  } = useContext(ProductContext);
  const navigate = useNavigate();

  const [deliveryOption, setDeliveryOption] = useState("deliver");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryLocation, setDeliveryLocation] = useState(""); // Track delivery location input
  const inputRef = useRef(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Nakasero Market coordinates
  const companyLocation = { lat: 0.3175, lng: 32.5825 };

  const [googleMaps, setGoogleMaps] = useState(null);
  const distanceCache = useRef(new Map()); // Cache for storing distances

  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then((google) => {
        setGoogleMaps(google.maps);
        console.log("Google Maps API loaded successfully");

        if (inputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: "UG" },
            fields: ["formatted_address", "geometry"],
          });

          const debouncedCalculateDeliveryFee = debounce((userCoords) => {
            calculateDeliveryFee(userCoords);
          }, 500); // Debounce for 500ms

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
              setDeliveryLocation(place.formatted_address); // Update delivery location
              debouncedCalculateDeliveryFee(place.geometry.location);
            } else {
              console.error("No geometry found for the selected place");
            }
          });
        }
      })
      .catch((error) => {
        console.error("Error loading Google Maps API:", error);
      });
  }, []);

  const calculateDeliveryFee = (userCoords) => {
    if (!googleMaps) {
      console.error("Google Maps not loaded");
      return;
    }

    const cacheKey = `${userCoords.lat()},${userCoords.lng()}`;
    if (distanceCache.current.has(cacheKey)) {
      setDeliveryFee(distanceCache.current.get(cacheKey));
      return;
    }

    const service = new googleMaps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [companyLocation],
        destinations: [{ lat: userCoords.lat(), lng: userCoords.lng() }],
        travelMode: "DRIVING",
      },
      (response, status) => {
        if (status === "OK") {
          const distanceInKm = response.rows[0].elements[0].distance.value / 1000;
          const roundedDistance = Math.ceil(distanceInKm);
          let fee = roundedDistance * 800;

          // Ensure delivery fee is not below 2000 UGX
          if (fee < 2000) {
            fee = 2000;
          }

          setDeliveryFee(fee);
          distanceCache.current.set(cacheKey, fee); // Cache the result
        } else {
          console.error("Error fetching distance:", status);
        }
      }
    );
  };

  const handleCheckout = () => {
    if (deliveryOption === "deliver" && !deliveryLocation.trim()) {
      alert("Please first fill in your delivery location Or change Delivery Option");
      inputRef.current.focus(); // Focus on the delivery location input
      return;
    }
    navigate("/checkout");
  };

  const finalTotal = useMemo(() => {
    return getTotalCartAmount() + (deliveryOption === "deliver" ? deliveryFee : 0);
  }, [getTotalCartAmount, deliveryOption, deliveryFee]);

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
                <option value="deliver">Deliver</option>
                <option value="pickup">Pickup (No Delivery Fee)</option>
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
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
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
          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>
      </div>
    </div>
  );
};

export default CartItems;