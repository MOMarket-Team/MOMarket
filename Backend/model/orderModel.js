const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  cartData: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
  phone: { type: String, required: true },
  location: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["cash_on_delivery", "mobile_money"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending", // Ensure default is "pending"
  },
  date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
