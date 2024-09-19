const express = require('express');
const { addToCart, getCart } = require('../controllers/cartController');
const { fetchUser } = require('../middleware/wires');

const router = express.Router();

router.post('/cart/add', fetchUser, addToCart); // User must be authenticated to add to cart
router.get('/cart', fetchUser, getCart); // User must be authenticated to view cart

module.exports = router;
