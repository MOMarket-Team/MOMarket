const express = require('express');
const { placeOrder } = require('../controllers/orderController');
const { fetchUser, ensureCartNotEmpty } = require('../middleware/wires');

const router = express.Router();

router.post('/checkout', fetchUser, ensureCartNotEmpty, placeOrder); // Protect order route with authentication

module.exports = router;