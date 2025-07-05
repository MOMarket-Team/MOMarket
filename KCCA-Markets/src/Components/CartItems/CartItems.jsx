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
    getTotalCartAmount,
  } = useContext(ProductContext);
  const navigate = useNavigate();

  const [deliveryOption, setDeliveryOption] = useState("deliver");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [pinCoords, setPinCoords] = useState(null);

  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [googleMaps, setGoogleMaps] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const distanceCache = useRef(new Map());

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://mangumarket.up.railway.app";
  const companyLocation = { lat: 0.3113, lng: 32.5799 }; // Kampala

  const fetchGoogleMapsApiKey = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/maps-key`);
      if (!response.ok) throw new Error("Failed to fetch Google Maps API key");
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
      if (!apiKey) return console.error("Google Maps API key is missing");

      const loader = new Loader({ apiKey, version: "weekly", libraries: ["places"] });

      loader
        .load()
        .then((google) => {
          setGoogleMaps(google.maps);
          setMapsLoaded(true);

          if (inputRef.current) {
            const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
              componentRestrictions: { country: "UG" },
              fields: ["formatted_address", "geometry"],
            });

            const debouncedCalculateDeliveryFee = debounce((location) => {
              calculateDeliveryFee(location);
            }, 500);

            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace();
              if (place.geometry) {
                setDeliveryLocation(place.formatted_address);
                debouncedCalculateDeliveryFee(place.geometry.location);
              }
            });
          }

          if (mapRef.current) {
            const map = new google.maps.Map(mapRef.current, {
              center: companyLocation,
              zoom: 12,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
            });

            map.addListener("click", (e) => {
              const coords = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              };
              setPinCoords(coords);

              if (!markerRef.current) {
                markerRef.current = new google.maps.Marker({
                  position: coords,
                  map,
                  draggable: true,
                });
              } else {
                markerRef.current.setPosition(coords);
              }

              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ location: coords }, (results, status) => {
                if (status === "OK" && results[0]) {
                  setDeliveryLocation(results[0].formatted_address);
                }
              });

              const latLng = new google.maps.LatLng(coords.lat, coords.lng);
              calculateDeliveryFee(latLng);
            });
          }
        })
        .catch((error) => console.error("Error loading Google Maps API:", error));
    };

    initializeGoogleMaps();
  }, [mapsLoaded]);

  const calculateDeliveryFee = (userCoords) => {
    if (!mapsLoaded || !googleMaps) return;

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
          const rounded = Math.ceil(distanceInKm);
          let fee = rounded * 800;
          if (fee < 2000) fee = 2000;
          setDeliveryFee(fee);
          distanceCache.current.set(cacheKey, fee);
        } else {
          console.error("Distance matrix error:", status);
        }
      }
    );
  };

  const handleCheckout = () => {
    if (deliveryOption === "deliver" && !deliveryLocation.trim() && !pinCoords) {
      alert("Please enter a delivery location or drop a pin.");
      inputRef.current.focus();
      return;
    }

    const subtotal = getTotalCartAmount();
    const serviceFee = subtotal * 0.07;
    const deliveryFeeToUse = deliveryOption === "deliver" ? deliveryFee : 0;
    const totalAmount = subtotal + serviceFee + deliveryFeeToUse;

    navigate("/checkout", {
      state: {
        deliveryOption,
        deliveryFee: deliveryFeeToUse,
        deliveryLocation,
        pinCoords,
        subtotal,
        serviceFee,
        totalAmount,
      },
    });
  };

  const subtotal = getTotalCartAmount();
  const serviceFee = useMemo(() => subtotal * 0.07, [subtotal]);
  const totalAmount = useMemo(() => subtotal + serviceFee + (deliveryOption === "deliver" ? deliveryFee : 0), [subtotal, serviceFee, deliveryOption, deliveryFee]);

  return (
    <div className="cartitems">
      <div className="format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity/Weight(kg)</p>
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
              <p>{
                e.measurement === "Set"
                  ? prodprice.format(e.basePrice)
                  : e.measurement === "Whole"
                  ? prodprice.format(e.sizeOptions[e.selectedSize])
                  : prodprice.format(e.price)
              }</p>
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
              <p>{
                e.measurement === "Set"
                  ? prodprice.format(e.quantity)
                  : e.measurement === "Whole"
                  ? prodprice.format(e.sizeOptions[e.selectedSize] * e.quantity)
                  : prodprice.format(e.price * e.quantity)
              }</p>
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
      <div className="down">
        <div className="total">
          <h1>Cart Totals</h1>
          <div className="total-item"><p>Subtotal</p><p>{prodprice.format(subtotal)}</p></div>
          <hr />
          <div className="total-item"><p>Service Fee</p><p>{prodprice.format(serviceFee)}</p></div>
          <hr />
          <div className="total-item">
            <p>Delivery Option</p>
            <select value={deliveryOption} onChange={(e) => setDeliveryOption(e.target.value)}>
              <option value="deliver">Deliver</option>
              <option value="pickup">Pickup (No Delivery Fee)</option>
            </select>
          </div>

          {deliveryOption === "deliver" && (
            <>
              <hr />
              <div className="total-item">
                <p>Delivery Location</p>
                <input
                  type="text"
                  placeholder="Enter your delivery location"
                  ref={inputRef}
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="delivery-location-input"
                />
              </div>
              <div className="total-item"><p>Or Drop a Pin</p></div>
              <div
                ref={mapRef}
                style={{ width: "100%", height: "400px", marginTop: "10px", borderRadius: "8px" }}
              ></div>
              <div className="total-item">
                <p>Delivery Fee</p>
                <span>{prodprice.format(deliveryFee)}</span>
              </div>
            </>
          )}

          <hr />
          <div className="total-item"><h3>Total</h3><h3>{prodprice.format(totalAmount)}</h3></div>
          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>
      </div>
    </div>
  );
};

export default CartItems;