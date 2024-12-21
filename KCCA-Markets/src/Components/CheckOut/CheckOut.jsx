import React, { useState, useContext } from 'react';
import { ProductContext } from '../../Context/ProductContext';
import { FlutterWaveButton } from 'flutterwave-react-v3';
import axios from 'axios';
import ClientOrders from '../ClientOrders/ClientOrders'; // Import for modal
import './CheckOut.css';
import logo1 from '../Assets/logo.png';

const CheckOut = () => {
  const { getTotalCartAmount, clearCart, cartItems } = useContext(ProductContext);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [amount, setAmount] = useState(0);
  const [delivererNumber, setDelivererNumber] = useState('');
  const [customer, setCustomer] = useState({ email: '', name: '' });
  const [isOrderStatusVisible, setIsOrderStatusVisible] = useState(false); // Modal visibility state

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
    console.log('Flutterwave response:', response);
    if (response.status === 'successful') {
      await handleCheckout(response.transaction_id);
    } else {
      alert('Payment failed');
    }
  };

  const handleCheckout = async (transaction_id = null) => {
    console.log('Starting checkout process...');
    if (cartItems.length === 0) {
      alert('Your cart is empty. Add items to your cart before checking out.');
      console.log('Checkout aborted: Cart is empty');
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      console.log('Auth token:', token);

      const checkoutData = {
        phone,
        location,
        paymentMethod,
        amount: cartTotal,
        transaction_id,
        cartData: cartItems,
      };

      console.log('Checkout data:', checkoutData);

      const response = await axios.post('http://localhost:4000/checkout', checkoutData, {
        headers: {
          'auth-token': token,
        },
      });

      console.log('Checkout response:', response.data);

      if (response.data.success) {
        setDelivererNumber(response.data.deliveryContact);
        setIsOrderStatusVisible(true); // Show the order status modal
        alert('Order placed successfully');

        const clearCartResponse = await axios.post('http://localhost:4000/clearcart', {}, {
          headers: {
            'auth-token': token,
          },
        });

        console.log('Clear cart response:', clearCartResponse.data);

        if (clearCartResponse.data.success) {
          clearCart();
          alert('Cart cleared successfully');
        } else {
          alert(clearCartResponse.data.message);
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
      }
      alert('Failed to checkout');
    }
  };

  return (
    <div className='checkout-container'>
      <h1>Checkout</h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor='phone'>Phone Number:</label>
        <input
          id='phone'
          type='text'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder='Enter your phone number'
        />

        <label htmlFor='location'>Location:</label>
        <input
          id='location'
          type='text'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder='Enter your delivery location'
        />

        <label htmlFor='payment-method'>Payment Method:</label>
        <select
          id='payment-method'
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value='cash_on_delivery'>Cash on Delivery</option>
          <option value='mobile_money'>Mobile Money</option>
        </select>

        {paymentMethod === 'mobile_money' && (
          <>
            <label htmlFor='amount'>Amount:</label>
            <input
              id='amount'
              type='number'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder='Enter the amount to pay'
            />
          </>
        )}

        {paymentMethod === 'mobile_money' ? (
          <FlutterWaveButton
            {...config}
            text='Pay with Flutterwave'
            callback={handleFlutterwavePayment}
            className='checkout-button'
          />
        ) : (
          <button
            onClick={() => {
              console.log('Cash on Delivery checkout clicked');
              handleCheckout();
            }}
            className='checkout-button'
          >
            Checkout
          </button>
        )}
      </form>

      {delivererNumber && (
        <div className='delivery-info'>
          <p>Deliverer's Contact: {delivererNumber}</p>
        </div>
      )}

      {isOrderStatusVisible && (
        <div className='modal'>
          <ClientOrders delivererNumber={delivererNumber} />
          <button onClick={() => setIsOrderStatusVisible(false)} className='close-modal'>
            Close
          </button>
        </div>
      )}

      {!isOrderStatusVisible && delivererNumber && (
        <div className='review-order'>
          <button onClick={() => setIsOrderStatusVisible(true)} className='review-button'>
            Review Your Order
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckOut;