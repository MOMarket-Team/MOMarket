import React, { useState, useEffect, useContext } from 'react';
import { ProductContext } from '../../Context/ProductContext';
import { FlutterWaveButton } from 'flutterwave-react-v3';
import axios from 'axios';
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
    console.log('Payment Method:');
    
    if (cartItems.length === 0) {
        alert('Your cart is empty. Add items to your cart before checking out.');
        return;
    }

    try {
        const token = localStorage.getItem('auth-token');
        const transaction_id = paymentMethod === 'cash_on_delivery' ? null : someTransactionIdVariable; // Set transaction_id conditionally

        // Log the data being sent in the request
        console.log('Checkout Request Data:', {
            phone,
            location,
            paymentMethod,
            amount: cartTotal,
            transaction_id,
        });

        const response = await axios.post(
            'http://localhost:4000/checkout',
            {
                phone,
                location,
                paymentMethod,
                amount: cartTotal,
                transaction_id,
                cartData: cartItems
            },
            {
                headers: {
                    'auth-token': token,
                },
            }
        );

        // Log the API response
        console.log('Checkout Response:', response.data);

        if (response.data.success) {
            setDelivererNumber(response.data.deliveryContact);
            alert('Order placed successfully');

            const clearCartResponse = await axios.post(
                'http://localhost:4000/clearcart',
                {},
                {
                    headers: {
                        'auth-token': token,
                    },
                }
            );

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
        // Log the error object
        console.error('Checkout error:', error);
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
            console.error('Error Response Status:', error.response.status);
            console.error('Error Response Headers:', error.response.headers);
        }
        alert('Failed to checkout');
    }
};  

  return (
    <div className='checkout'>
      <h2 className='checkout_h1'>Checkout</h2>
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