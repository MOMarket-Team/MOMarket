const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const twilio = require('twilio');
// const client = twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

mongoose.connect(
  "mongodb+srv://khabertkcca:Khabert%2311@cluster0.mzb08dh.mongodb.net/kcca_online_marketing"
);

// Model definitions
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

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
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending", // Ensure default is "pending"
  },
  date: { type: Date, default: Date.now },
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/images",
  filename: (req, file, cb) => {
    cb(
      null,
      $`{file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage: storage });

app.use("/images", express.static("uploads/images"));

app.get("/", (req, res) => {
  res.send("Express App is Running");
});

app.post("/uploads", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

// Authentication middleware
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token)
    return res
      .status(401)
      .send({ errors: "Please authenticate using a valid token" });

  try {
    const data = jwt.verify(token, "secret_ecom");
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
  let newcollection = products.slice(1).slice(-8);
  res.send(newcollection);
});

app.get("/popularinfruit", async (req, res) => {
  let products = await Product.find({ category: "Fruits" });
  let popular_in_fruit = products.slice(0, 4);
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
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  await user.save();

  const data = { user: { id: user.id } };
  const token = jwt.sign(data, "secret_ecom");
  res.json({ success: true, token });
});

app.post("/login", async (req, res) => {
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

app.get('/getuser', (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access Denied' });
    }

    try {
        const data = jwt.verify(token, 'secret_ecom');
        Users.findById(data.user.id, { name: 1, email: 1 })
            .then(user => res.json({ success: true, user }))
            .catch(() => res.status(500).json({ success: false, message: 'Internal Error' }));
    } catch {
        res.status(401).json({ success: false, message: 'Invalid Token' });
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
          status: 'pending',
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
          message: 'Checkout successful',
          deliveryContact: '+256 789 123 456',
      });
  } catch (error) {
      console.error('Error during checkout:', error);
      res.status(500).json({ success: false, message: 'Checkout failed', error: error.message });
  }
});

app.get('/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId')
      .populate('cartData.product');
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error });
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

app.get('/search', async (req, res) => {
    try {
        const query = req.query.q ? req.query.q.toLowerCase() : '';

        // Handle empty query
        if (!query.trim()) {
            return res.json({ success: true, products: [] });
        }

        // Search products using MongoDB query
        const filteredProducts = await Product.find({
            name: { $regex: query, $options: 'i' }, // Case-insensitive search
        });

        res.json({
            success: true,
            products: filteredProducts,
        });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform search',
        });
    }
});

// for statuses on delivery 
app.put('/admin/orders/:id/status', async (req, res) => { 
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
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get('/my-orders', fetchUser, async (req, res) => {
  try {
    const userId = req.user?.id; // Ensure `fetchUser` middleware adds `req.user`
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const orders = await Order.find({ userId }).populate('cartData.product');
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error });
  }
});

// Delete an order by ID
app.delete('/admin/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete order', error });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
