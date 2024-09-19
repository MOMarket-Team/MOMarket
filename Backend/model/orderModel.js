const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
        required: true,
    },
    status: {
        type: String,
        default: 'pending', // pending, shipped, delivered, etc.
    },
    deliveryAddress: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'mobile_money'],
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;