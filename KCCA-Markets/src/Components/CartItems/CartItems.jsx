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
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const inputRef = useRef(null);

  const [googleMaps, setGoogleMaps] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const distanceCache = useRef(new Map());

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://momarket-7ata.onrender.com";
  const companyLocation = { lat: 0.3175, lng: 32.5825 };

  // Fetch the Google Maps API key from the backend
  const fetchGoogleMapsApiKey = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/maps-key`);
      if (!response.ok) {
        throw new Error("Failed to fetch Google Maps API key");
      }
      const data = await response.json();
      return data.key;
    } catch (error) {
      console.error("Error fetching Google Maps API key:", error);
      return null;
    }
  };

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      const apiKey = await fetchGoogleMapsApiKey();
      if (!apiKey) {
        console.error("Google Maps API key is missing");
        return;
      }

      const loader = new Loader({
        apiKey: apiKey,
        version: "weekly",
        libraries: ["places"],
      });

      loader
        .load()
        .then((google) => {
          setGoogleMaps(google.maps);
          setMapsLoaded(true);
          console.log("Google Maps API loaded successfully");

          if (inputRef.current) {
            const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
              componentRestrictions: { country: "UG" },
              fields: ["formatted_address", "geometry"],
            });

            const debouncedCalculateDeliveryFee = debounce((userCoords) => {
              calculateDeliveryFee(userCoords);
            }, 500);

            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace();
              if (place.geometry) {
                setDeliveryLocation(place.formatted_address);
                if (mapsLoaded) {
                  debouncedCalculateDeliveryFee(place.geometry.location);
                } else {
                  console.warn("Google Maps API is still loading.");
                }
              } else {
                console.error("No geometry found for the selected place");
              }
            });
          }
        })
        .catch((error) => {
          console.error("Error loading Google Maps API:", error);
        });
    };

    initializeGoogleMaps();
  }, [mapsLoaded]);

  const calculateDeliveryFee = (userCoords) => {
    if (!mapsLoaded || !googleMaps) {
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

          if (fee < 2000) {
            fee = 2000;
          }

          setDeliveryFee(fee);
          distanceCache.current.set(cacheKey, fee);
        } else {
          console.error("Error fetching distance:", status);
        }
      }
    );
  };

  const handleCheckout = () => {
    if (deliveryOption === "deliver" && !deliveryLocation.trim()) {
      alert("Please first fill in your delivery location or change the delivery option");
      inputRef.current.focus();
      return;
    }

    const totalAmount = getTotalCartAmount() + (deliveryOption === "deliver" ? deliveryFee : 0);

    navigate("/checkout", {
      state: {
        deliveryOption,
        deliveryFee: deliveryOption === "deliver" ? deliveryFee : 0,
        deliveryLocation,
        totalAmount,
      },
    });
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
        <p>Price</p>
        <p>Quantity/Weight(kg)</p>
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
              <p>
                {e.measurement === "Set"
                  ? `${prodprice.format(e.basePrice)}`
                  : e.measurement === "Whole"
                  ? `${prodprice.format(e.sizeOptions[e.selectedSize])}`
                  : `${prodprice.format(e.price)}`}
              </p>
              <div className="quantity-control">
                <input
                  type="number"
                  className="quantity"
                  value={e.quantity}
                  min={e.measurement === "Kgs" ? 0.5 : e.measurement === "Set" ? e.basePrice : 1}
                  step={e.measurement === "Kgs" ? 0.5 : e.measurement === "Set" ? 1000 : 1}
                  onChange={(event) => {
                    const newQuantity = parseFloat(event.target.value) || 0.5;
                    updateItemQuantity(e.id, Math.max(0.5, newQuantity));
                  }}
                  style={{ width: "70px" }}
                />
                <span>{e.measurement === "Set" ? "" : "kg"}</span>
              </div>
              <p>
                {e.measurement === "Set"
                  ? `${prodprice.format(e.quantity)}`
                  : e.measurement === "Whole"
                  ? `${prodprice.format(e.sizeOptions[e.selectedSize] * e.quantity)}`
                  : `${prodprice.format(e.price * e.quantity)}`}
              </p>
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
      {!mapsLoaded && (
        <div className="loading-message">
          <p>Google Maps API is still loading. Please wait...</p>
        </div>
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