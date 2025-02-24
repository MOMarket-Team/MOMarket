const dotenv = require("dotenv");
const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const bcrypt = require("bcrypt");
const { pingServer, PING_INTERVAL } = require("./utils/keepAlive");
const cloudinary = require("./utils/cloudinary");
const fs = require("fs");

dotenv.config();

const app = express();
const port = 4000;
const TWILIO_ACCOUNT_SID = 'ACbaa698170880348e9b05781abc462cf2';
const TWILIO_AUTH_TOKEN = '06f32d305680a3f3c8543f3446978d6a';
const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+17073923274';
const TWILIO_SMS_NUMBER = '+17073923274'; // Twilio SMS number
const YOUR_PHONE_NUMBER_1 = '+256708853662';
const YOUR_PHONE_NUMBER_2 = '+256762100982';

// Initialize Twilio Client
const client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'manguonlinemarket@gmail.com',
    pass: 'manguonlinemarketwth1345#',
  },
});

app.use(express.json({ limit: '50mb' })); // Increase limit to 10MB
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Apply to form-encoded data

// CORS configuration
const BASE_URL = process.env.BASE_URL;

app.use(
  cors({
    origin: process.env.CORS_ORIGINS.split(','),
    credentials: true,
  })
);

app.options("*", cors());

pingServer();

setInterval(pingServer, PING_INTERVAL);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Run the function to update image URLs
    updateImageURLs();
  })
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Define Product model
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

// Update image URLs function
async function updateImageURLs() {
  try {
    const products = await Product.find({
      image: { $regex: "localhost:4000" },
    });
    for (const product of products) {
      product.image = product.image.replace(
        "localhost:4000",
        "momarket.onrender.com"
      );
      await product.save();
    }
    console.log("Image URLs updated successfully");
  } catch (err) {
    console.error("Error updating image URLs:", err);
  }
}

const Users = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  date: { type: Date, default: Date.now },
  phone: { type: String },
  location: { type: String },
});
//Order Model
const Order = mongoose.model("Order", {
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
  deliveryTime: {
    type: String, // Could be an enum if needed
    enum: [
      "now",
      "morning(Today)",
      "afternoon(Today)",
      "evening(Today)",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    default: "now", // Default to "now"
  },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  date: { type: Date, default: Date.now },
});

const AdminUser = mongoose.model("AdminUser", {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// Hash the password before saving
// AdminUser.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

const upload = multer({ dest: "uploads/" });

app.use("/images", express.static("uploads/images"));

app.get("/", (req, res) => {
  res.send("Express App is Running");
});

app.post("/uploads", upload.single("product"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }

  try {
    const filePath = req.file.path;
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "momarket",
      resource_type: "image",
    });

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: 1,
      message: "File uploaded successfully",
      image_url: result.secure_url,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      success: 0,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Authentication middleware
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token)
    return res
      .status(401)
      .send({ errors: "Please authenticate using a valid token" });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

// Middleware to ensure cart is not empty
const ensureCartNotEmpty = (req, res, next) => {
  console.log("Processing cart data:", req.user.id);

  console.log("request body", req.body);

  // Check if cart is empty
  if (
    !req.body.cartData ||
    Object.values(req.body.cartData).every((item) => item === 0)
  ) {
    return res.status(400).json({ success: false, message: "Cart is empty." });
  }

  next();
};

// Routes for product operations
app.post("/addproduct", async (req, res) => {
  try {
    let products = await Product.find({});
    let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      price: req.body.price,
    });

    await product.save();
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to save product", error });
  }
});

app.post("/updateproduct", async (req, res) => {
  try {
    const { id, name, image, category, price } = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { id: id },
      { name, image, category, price },
      { new: true } // Return the updated product
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update product", error });
  }
});

app.post("/removeproduct", async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to remove product", error });
  }
});

app.get("/allproducts", async (req, res) => {
  try {
    let products = await Product.find({});
    res.send(products);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products", error });
  }
});
app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-12);
  res.send(newcollection);
});

app.get("/popularinfruit", async (req, res) => {
  let products = await Product.find({ category: "Fruits" });
  let popular_in_fruit = products.slice(0, 6);
  res.send(popular_in_fruit);
});

// Routes for user authentication
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res
      .status(400)
      .json({ success: false, errors: "existing email address" });
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });

  await user.save();

  const data = { user: { id: user.id } };
  const token = jwt.sign(data, "secret_ecom");
  res.json({ success: true, token });
});

app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = await bcrypt.compare(req.body.password, user.password);
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

app.get("/getuser", (req, res) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Access Denied" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    Users.findById(data.user.id, { name: 1, email: 1 })
      .then((user) => res.json({ success: true, user }))
      .catch(() =>
        res.status(500).json({ success: false, message: "Internal Error" })
      );
  } catch {
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
});

// Fetch customer details
app.get("/customer", fetchUser, async (req, res) => {
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

// Routes for cart operations
app.post("/addtocart", fetchUser, async (req, res) => {
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

app.post("/removefromcart", fetchUser, async (req, res) => {
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

app.post('/checkout', fetchUser, ensureCartNotEmpty, async (req, res) => {
  console.log('Request body:', req.body);
  const { phone, location, paymentMethod, amount, transaction_id, cartData } = req.body;

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
      transaction_id: paymentMethod === 'cash_on_delivery' ? null : transaction_id,
      deliveryTime: req.body.deliveryTime || 'now', // Default to "now" if not provided
      status: 'pending',
      date: new Date(),
    });

    // Ensure all orders have a default deliveryTime if missing
    await Order.updateMany(
      { deliveryTime: { $exists: false } }, // Find orders missing the field
      { $set: { deliveryTime: 'now' } } // Set a default value
    );

    await newOrder.save();

    // ✅ Send WhatsApp Notification
    await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: 'whatsapp:+256708853662', // Your WhatsApp number
      body: `📢 New Order Received!\n\nTotal: ${amount} UGX\nLocation: ${location}\nPayment: ${paymentMethod}`,
    });

    // ✅ Send SMS Notification
    await client.messages.create({
      from: '+17073923274',
      to: YOUR_PHONE_NUMBER_1,
      body: `📢 New Order Alert! Amount: ${amount} UGX, Location: ${location}`,
    });

    await client.messages.create({
      from: '+17073923274',
      to: YOUR_PHONE_NUMBER_2,
      body: `📢 New Order Alert! Amount: ${amount} UGX, Location: ${location}`,
    });

    // ✅ Send Email Notification
    const mailOptions = {
      from: 'manguonlinemarket@gmail.com',
      to: 'khabertzion11@gmail.com',
      subject: '📦 New Order Received!',
      text: `A new order has been placed.\n\nTotal: ${amount} UGX\nLocation: ${location}\nPayment Method: ${paymentMethod}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Checkout successful',
      deliveryContact: '+256 708853662',
    });

  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Checkout failed',
      error: error.message,
    });
  }
});

app.get("/admin/orders", async (req, res) => {
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
});

// Checkout route with Flutterwave integration
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
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
});
app.post("/clearcart", fetchUser, async (req, res) => {
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

app.get("/search", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.toLowerCase() : "";

    // Handle empty query
    if (!query.trim()) {
      return res.json({ success: true, products: [] });
    }

    // Search products using MongoDB query
    const filteredProducts = await Product.find({
      name: { $regex: query, $options: "i" }, // Case-insensitive search
    });

    res.json({
      success: true,
      products: filteredProducts,
    });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform search",
    });
  }
});

// for statuses on delivery
app.put("/admin/orders/:id/status", async (req, res) => {
  const { id } = req.params; // Extract the order ID
  const { status } = req.body; // Extract the new status from the request body

  // Validate the new status
  const validStatuses = ["pending", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
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
});

app.get("/my-orders", fetchUser, async (req, res) => {
  try {
    const userId = req.user?.id; // Ensure `fetchUser` middleware adds `req.user`
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({ userId }).populate("cartData.product");
    res.json({ success: true, orders });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders", error });
  }
});

// Delete an order by ID
app.delete("/admin/orders/:id", async (req, res) => {
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
});

// API to get products by category
app.get("/api/products/:category", async (req, res) => {
  try {
    const { category } = req.params;
    if (!category) {
      return res.status(400).json({ error: "Category parameter is required" });
    }

    console.log(`Category received: "${category}"`);

    // Case-insensitive search for matching products
    const products = await Product.find({
      category: { $regex: new RegExp(`^${category.trim()}`, "i") },
    });

    if (products.length === 0) {
      console.log("No products found for this category.");
    }

    console.log(`Products fetched: ${JSON.stringify(products)}`);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Failed to fetch products");
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Add an admin user
app.post('/adminusers', async (req, res) => {
  const { name, email, password } = req.body;
  try {
      const user = new AdminUser({ name, email, password });
      await user.save();
      res.status(201).json({ message: 'Admin user created successfully' });
  } catch (err) {
      res.status(500).json({ error: 'Error creating admin user', details: err });
  }
});

// Login admin user
app.post('/loginA', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    console.log('MONGODB_URI', process.env.MONGODB_URI);
    console.log('Login request received:', email);

    const user = await AdminUser.findOne({ email });
    if (!user) {
      console.error('User not found:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    if (password !== user.password) {
      console.error('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Token generated successfully for user:', email);

    res.status(200).json({ token });
  } catch (err) {
    console.error('JWT generation error:', err.message);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.get('/admin/details', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await AdminUser.findById(decoded.id);
      if (!admin) {
          return res.status(404).json({ error: 'Admin not found' });
      }
      res.json({ name: admin.name });
  } catch (err) {
      res.status(500).json({ error: 'Failed to fetch admin details', details: err });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
