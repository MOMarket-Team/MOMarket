const Order = require("../model/orderModel");

const orderController = {
  checkout: async (req, res) => {
    const { phone, location, paymentMethod, amount, transaction_id, cartData } =
      req.body;

    try {
      // Save the order to the database
      const newOrder = new Order({
        userId: req.user.id,
        cartData: cartData.map(({ _id, quantity }) => ({
          product: _id,
          quantity,
        })),
        phone,
        location,
        totalAmount: amount,
        paymentMethod,
        transaction_id:
          paymentMethod === "cash_on_delivery" ? null : transaction_id,
        status: "pending",
        date: new Date(),
      });

      await newOrder.save();

      // Notify admin via email
      // const transporter = nodemailer.createTransport({
      //     service: 'Gmail',
      //     auth: {
      //         user: 'your-email',
      //         pass: 'your-password',
      //     },
      // });

      // const emailMessage = `A new order has been placed.
      // Phone: ${phone}
      // Location: ${location}
      // Total Amount: ${amount}
      // Payment Method: ${paymentMethod}
      // Products:
      // ${cartData.map((item) => `${item.product.name} (Qty: ${item.quantity})`).join('\n')}
      // `;

      // await transporter.sendMail({
      //     from: 'admin-email',
      //     to: 'delivery-email',
      //     subject: `New Order Placed (#${newOrder._id})`,
      //     text: emailMessage,
      // });

      // // Notify admin via WhatsApp
      // const whatsappMessage = `New Order Placed:
      // Phone: ${phone}
      // Location: ${location}
      // Total Amount: ${amount}
      // Payment Method: ${paymentMethod}
      // Products:
      // ${cartData.map((item) => `${item.product.name} (Qty: ${item.quantity})`).join('\n')}
      // `;

      // await client.messages.create({
      //     from: 'whatsapp:+14155238886', // Twilio's WhatsApp number
      //     to: 'whatsapp:your-number',
      //     body: whatsappMessage,
      // });

      res.json({
        success: true,
        message: "Checkout successful",
        deliveryContact: "+256 789 123 456",
      });
    } catch (error) {
      console.error("Error during checkout:", error);
      res.status(500).json({
        success: false,
        message: "Checkout failed",
        error: error.message,
      });
    }
  },
  adminOrders: async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("userId")
        .populate("cartData.product");
      res.json({ success: true, orders });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch orders", error });
    }
  },
  adminUpdateOrder: async (req, res) => {
    const { id } = req.params; // Extract the order ID
    const { status } = req.body; // Extract the new status from the request body

    // Validate the new status
    const validStatuses = ["pending", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    try {
      // Update the order status in the database
      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true } // Return the updated document
      );

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      res.json({
        success: true,
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
  getUsersOrders: async (req, res) => {
    try {
      const userId = req.user?.id; // Ensure `fetchUser` middleware adds `req.user`
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const orders = await Order.find({ userId }).populate("cartData.product");
      res.json({ success: true, orders });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch orders", error });
    }
  },
  deleteOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedOrder = await Order.findByIdAndDelete(id);

      if (!deletedOrder) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      res.json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete order", error });
    }
  },
};

module.exports = orderController;
