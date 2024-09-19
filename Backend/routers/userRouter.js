const express = require("express");
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

const { ensureCartNotEmpty, fetchUser } = require("../middleware/wires");
const Users = require("../model/userModel");

const UserRouter = require("express").Router();

UserRouter.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res
      .status(400)
      .json({ success: false, errors: "existing email address" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = { user: { id: user.id } };
  const token = jwt.sign(data, "secret_ecom");
  res.json({ success: true, token });
});

UserRouter.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = { user: { id: user.id } };
      const token = jwt.sign(data, "secret_ecom");
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: "Wrong Password" });
    }
  } else {
    res.json({ success: false, errors: "wrong Email Id" });
  }
});

// cart items

UserRouter.post("/addtocart", fetchUser, async (req, res) => {
  try {
    let userData = await Users.findById(req.user.id);
    if (!userData) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    userData.cartData[req.body.itemId] += 1;
    await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
    res.json({ message: "Added" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to add to cart", error });
  }
});

UserRouter.post("/removefromcart", fetchUser, async (req, res) => {
  try {
    let userData = await Users.findById(req.user.id);
    if (!userData) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (userData.cartData[req.body.itemId] > 0) {
      userData.cartData[req.body.itemId] -= 1;
    }
    await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
    res.json({ message: "Removed" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to remove from cart", error });
  }
});

UserRouter.post(
  "/checkout",
  fetchUser,
  ensureCartNotEmpty,
  async (req, res) => {
    try {
      const { phone, location, paymentMethod, amount, transaction_id } =
        req.body;
      let userData = await Users.findById(req.user.id);

      if (!phone || !location) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Phone number and location are required",
          });
      }

      // Calculate cart total
      let cartTotal = 0;
      for (const [itemId, quantity] of Object.entries(userData.cartData)) {
        if (quantity > 0) {
          const product = await Product.findOne({ id: itemId });
          cartTotal += product.price * quantity;
        }
      }

      if (paymentMethod === "mobile_money" && cartTotal !== amount) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "The payment amount must equal the cart total for mobile money transactions",
          });
      }

      // Update user data with phone and location
      userData.phone = phone;
      userData.location = location;
      await userData.save();

      res.json({
        success: true,
        message: "Checkout successful",
        deliveryContact: "+256 789 123 456",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Checkout failed", error });
    }
  }
);

UserRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const secret = "FLWSECK_TEST-301513cfe5479f53a8fee5fcf0416b5a-X";
    const hash = req.headers["verif-hash"];

    if (!hash) {
      return res.status(400).send("No hash provided");
    }

    const calculatedHash = crypto
      .createHmac("sha256", secret)
      .update(req.rawBody)
      .digest("hex");

    if (hash !== calculatedHash) {
      return res.status(400).send("Invalid hash");
    }

    // Process the payment
    const paymentData = JSON.parse(req.body);

    // Validate the payment data and update order status in your database
    if (paymentData.status === "successful") {
      // Update order as paid
      // Example: const orderId = paymentData.data.order_id;
      // Update order status in your database
    }

    res.status(200).send("Webhook received");
  }
);

UserRouter.post("/clearcart", fetchUser, async (req, res) => {
  try {
    let userData = await Users.findById(req.user.id);
    if (!userData) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const defaultCart = {};
    for (let i = 0; i < 300; i++) {
      defaultCart[i] = 0;
    }

    userData.cartData = defaultCart;
    await userData.save();
    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to clear cart", error });
  }
});

UserRouter.get("/customer", fetchUser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (user) {
      res.json({
        success: true,
        customer: { email: user.email, name: user.name },
      });
    } else {
      res.json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

module.exports = UserRouter;
