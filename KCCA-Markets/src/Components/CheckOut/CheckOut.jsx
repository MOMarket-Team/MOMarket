import React, { useState, useEffect, useContext } from 'react';
import { ProductContext } from '../../Context/ProductContext';
import { FlutterWaveButton } from 'flutterwave-react-v3';
import axios from 'axios';
import './CheckOut.css';
import logo1 from '../Assets/logo.png';

const CheckOut = () => {
  const { getTotalCartAmount, clearCart } = useContext(ProductContext);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [amount, setAmount] = useState(0);
  const [delivererNumber, setDelivererNumber] = useState('');
  const [customer, setCustomer] = useState({ email: '', name: '' });

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      const token = localStorage.getItem('auth-token');
      try {
        const response = await axios.get('http://localhost:4000/customer', {
          headers: {
            'auth-token': token
          }
        });
        if (response.data.success) {
          setCustomer(response.data.customer);
        } else {
          console.error('Failed to fetch customer details:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching customer details:', error);
      }
    };
    fetchCustomerDetails();
  }, []);

  const cartTotal = getTotalCartAmount();

  const config = {
    public_key: 'FLWPUBK_TEST-37204d00156d46b5e6c40d9a27f4c5bc-X',
    tx_ref: Date.now(),
    amount: cartTotal,
    currency: 'UGX',
    payment_options: 'mobilemoneyuganda',
    customer: {
      email: customer.email,
      phone_number: phone,
      name: customer.name,
    },
    customizations: {
      title: 'KCCA Market',
      description: 'Payment for items in cart',
      logo: logo1,
    },
  };

  const handleFlutterwavePayment = async (response) => {
    if (response.status === 'successful') {
      await handleCheckout(response.transaction_id);
    } else {
      alert('Payment failed');
    }
  };

  const handleCheckout = async () => {
    console.log('Phone:', phone);
    console.log('Location:', location);
    console.log('Payment Method:', paymentMethod);
    console.log('Amount:', cartTotal);

    // If the cart is empty, show an alert
    if (cartTotal === 0) {
      alert('Your cart is empty. Add items to your cart before checking out.');
      return;
    }

    // Set transaction_id to null if payment method is cash on delivery
    const transaction_id = paymentMethod === 'cash_on_delivery' ? null : generateTransactionId(); // Use a function to generate the transaction ID for mobile money if necessary

    try {
      const token = localStorage.getItem('auth-token');
      const response = await axios.post(
        'http://localhost:4000/checkout',
        {
          phone,
          location,
          paymentMethod,
          amount: cartTotal,
          transaction_id, // Send null if cash_on_delivery
        },
        {
          headers: {
            'auth-token': token,
          },
        }
      );

      if (response.data.success) {
        setDelivererNumber(response.data.deliveryContact);
        alert('Order placed successfully');
        clearCart(); // Clear cart after successful checkout
      } else {
        alert(response.data.message); // Show the message from backend if failure
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to checkout');
    }
};

  return (
    <div className='checkout'>
      <h2>Checkout</h2>
      <label className='checkout-label'>Phone Number:</label>
      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className='checkout-input' />

      <label className='checkout-label'>Location:</label>
      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className='checkout-input' />

      <label className='checkout-label'>Payment Method:</label>
      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className='checkout-select'>
        <option value="cash_on_delivery">Cash on Delivery</option>
        <option value="mobile_money">Mobile Money</option>
      </select>

      {paymentMethod === 'mobile_money' && (
        <div>
          <label className='checkout-label amount'>Amount:</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className='checkout-input' />
        </div>
      )}

      {paymentMethod === 'mobile_money' ? (
        <FlutterWaveButton
          {...config}
          text="Pay with Flutterwave"
          callback={handleFlutterwavePayment}
        />
      ) : (
        <button onClick={() => handleCheckout()} className='checkout-button'>Checkout</button>
      )}

      {delivererNumber && (
        <div>
          <h3 className='checkout-deliverer'>Deliverer's Number: {delivererNumber}</h3>
        </div>
      )}
    </div>
  );
};

export default CheckOut;