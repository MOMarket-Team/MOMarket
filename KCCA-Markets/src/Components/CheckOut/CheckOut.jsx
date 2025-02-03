import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ProductContext } from "../../Context/ProductContext";
import { FlutterWaveButton } from "flutterwave-react-v3";
import axios from "axios";
import ClientOrders from "../ClientOrders/ClientOrders";
import "./CheckOut.css";
import logo1 from "../Assets/logo.png";

const CheckOut = () => {
  const { getTotalCartAmount, clearCart, cartItems } =
    useContext(ProductContext);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [location, setLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [amount, setAmount] = useState(0);
  const [delivererNumber, setDelivererNumber] = useState("");
  const [customer, setCustomer] = useState({ email: "", name: "" });
  const [isOrderStatusVisible, setIsOrderStatusVisible] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState("");

  const navigate = useNavigate();
  const locationState = useLocation(); // To track previous route
  const cartTotal = getTotalCartAmount();

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      alert("You need to log in to proceed to checkout.");
      navigate("/login", { state: { from: locationState.pathname } });
    }
  }, [navigate, locationState.pathname]);

  // Flutterwave configuration
  const config = {
    public_key: "FLWPUBK_TEST-37204d00156d46b5e6c40d9a27f4c5bc-X",
    tx_ref: Date.now(),
    amount: cartTotal,
    currency: "UGX",
    payment_options: "mobilemoneyuganda",
    customer: {
      email: customer.email,
      phone_number: phone,
      name: customer.name,
    },
    customizations: {
      title: "KCCA Market",
      description: "Payment for items in cart",
      logo: logo1,
    },
  };

  const handleFlutterwavePayment = async (response) => {
    console.log("Flutterwave response:", response);
    if (response.status === "successful") {
      await handleCheckout(response.transaction_id);
    } else {
      alert("Payment failed. Please try again.");
    }
  };

  const handleCheckout = async (transaction_id = null) => {
    if (cartItems.length === 0) {
      alert(
        "Your cart is empty. Please add items to your cart before checking out."
      );
      return;
    }
    if (!phone || error) {
      alert("Please enter a valid Ugandan phone number before checking out.");
      return;
    }

    try {
      const token = localStorage.getItem("auth-token");
      const checkoutData = {
        phone,
        location,
        paymentMethod,
        amount: cartTotal,
        transaction_id,
        cartData: cartItems,
        deliveryTime,
      };

      const response = await axios.post(
        "https://momarket-7ata.onrender.com/checkout",
        checkoutData,
        {
          headers: {
            "auth-token": token,
          },
        }
      );

      if (response.data.success) {
        setDelivererNumber(response.data.deliveryContact);
        setIsOrderStatusVisible(true);
        alert("Order placed successfully.");

        const clearCartResponse = await axios.post(
          "https://momarket-7ata.onrender.com/clearcart",
          {},
          {
            headers: {
              "auth-token": token,
            },
          }
        );

        if (clearCartResponse.data.success) {
          clearCart();
        } else {
          alert("Failed to clear the cart: " + clearCartResponse.data.message);
        }
      } else {
        alert("Checkout failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout. Please try again.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token && locationState?.state?.from) {
      navigate(locationState.state.from);
    }
  }, [navigate, locationState]);

  const validatePhone = (value) => {
    const ugandanPhoneRegex = /^(?:\+2567\d{8}|07\d{8})$/; // Valid: +2567XXXXXXXX or 07XXXXXXXX

    if (!ugandanPhoneRegex.test(value)) {
      setError("Invalid Ugandan phone number! Use +2567XXXXXXXX or 07XXXXXXXX");
    } else {
      setError("");
    }

    setPhone(value);
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <form onSubmit={(e) => e.preventDefault()}>
      <div>
      <label htmlFor="phone">Phone Number:</label>
      <input
        id="phone"
        type="text"
        value={phone}
        onChange={(e) => validatePhone(e.target.value)}
        placeholder="Enter your phone number"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>

        <label htmlFor="location">Location:</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter your delivery location"
        />

        <label htmlFor="payment-method">Payment Method:</label>
        <select
          id="payment-method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="cash_on_delivery">Cash on Delivery</option>
          <option value="mobile_money">Mobile Money</option>
        </select>

        {paymentMethod === "mobile_money" && (
          <label htmlFor="amount">
            Amount:
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter the amount to pay"
            />
          </label>
        )}

        {/* Optional Delivery Time Dropdown */}
        <label htmlFor="delivery-time">Delivery Time (Optional):</label>
        <select
          id="delivery-time"
          value={deliveryTime}
          onChange={(e) => setDeliveryTime(e.target.value)}
        >
          <option value="">Select Delivery Time</option>
          <option value="now">Now</option>
          <option value="morning">Morning(Today)</option>
          <option value="afternoon">Afternoon(Today)</option>
          <option value="evening">Evening(Today)</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>

        {paymentMethod === "mobile_money" ? (
          <FlutterWaveButton
            {...config}
            text="Pay with Flutterwave"
            callback={handleFlutterwavePayment}
            className="checkout-button" 
            disabled={!phone || error}
          />
        ) : (
          <button onClick={() => handleCheckout()} className="checkout-button" disabled={!phone || error}>
            Checkout
          </button>
        )}
      </form>

      {delivererNumber && (
        <div className="delivery-info">
          <p>Deliverer's Contact: {delivererNumber}</p>
        </div>
      )}

      {isOrderStatusVisible && (
        <div className="modal">
          <ClientOrders delivererNumber={delivererNumber} />
          <button
            onClick={() => setIsOrderStatusVisible(false)}
            className="close-modal"
          >
            Close
          </button>
        </div>
      )}

      {!isOrderStatusVisible && delivererNumber && (
        <div className="review-order">
          <button
            onClick={() => setIsOrderStatusVisible(true)}
            className="review-button"
          >
            Review Your Order
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckOut;
