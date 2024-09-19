const Cart = require('../model/cartModel');
const Product = require('../model/productModel');

// Add product to cart
const addToCart = async (req, res) => {
    const { product, totalPrice } = req.body;

    console.log(product, totalPrice);
    
    const userId = req.user._id;

    try {
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, products: [], totalPrice: 0 });
        }

        const product = await Product.findById(productId);
        const productInCart = cart.products.find(item => item.product.equals(productId));

        if (productInCart) {
            productInCart.quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }

        cart.totalPrice = cart.products.reduce((sum, item) => sum + (item.quantity * product.price), 0);
        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add to cart' });
    }
};

// Get cart for a user
const getCart = async (req, res) => {
    const userId = req.user._id;
    try {
        const cart = await Cart.findOne({ user: userId }).populate('products.product');
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

module.exports = { addToCart, getCart };