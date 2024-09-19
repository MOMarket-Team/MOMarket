const mongoose = require('mongoose');
const Schema = mongoose.Schema; 
const Cart = require('./cartModel');
const Order = require('./orderModel');

const userSchema = new Schema({
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    cartData: { type: Object },
    date: { type: Date, default: Date.now },
    phone: { type: String },
    location: { type: String },
    cart: {
        type: Schema.Types.ObjectId, // Capitalize "ObjectId"
        ref: 'Cart',
    },
    orders: [{
        type: Schema.Types.ObjectId, // Capitalize "ObjectId"
        ref: 'Order',
    }]
});

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
