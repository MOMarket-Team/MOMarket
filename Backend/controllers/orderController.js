const Cart = require('../model/cartModel');
const Order = require('../model/orderModel');
const User = require('../model/userModel');

// Place order
const placeOrder = async (req, res) => {
    const userId = req.user._id;
    const { phone, location, paymentMethod, amount, transaction_id } = req.body;

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ user: userId }).populate('products.product');
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Create a new order
        const newOrder = new Order({
            user: userId,
            products: cart.products,
            totalPrice: cart.totalPrice,
            orderDate: new Date(),
            phone,
            location,
            paymentMethod,
            transaction_id,
        });

        // Save the new order
        await newOrder.save();

        // Clear the cart after placing an order
        cart.products = [];
        cart.totalPrice = 0;
        await cart.save();

        // Example deliverer number (should be fetched from your data source)
        const delivererNumber = "Deliverer Number Placeholder";

        res.status(201).json({ success: true, deliveryContact: delivererNumber });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Failed to place order' });
    }
};

module.exports = { placeOrder };