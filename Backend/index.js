const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");

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
  status: { type: String, default: "Pending" },
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

app.post("/checkout", fetchUser, ensureCartNotEmpty, async (req, res) => {
  console.log("Payment Method:", req.body);

  const { phone, location, paymentMethod, amount, transaction_id } = req.body;

  try {
    // console.log('Checkout Request Data:', req.body); // Log request data
    // const { phone, location, paymentMethod, amount, transaction_id } = req.body;
    // let userData = await Users.findById(req.user.id);

    // if (!phone || !location) {
    //     console.log('Missing phone or location'); // Log failure point
    //     return res.status(400).json({ success: false, message: "Phone number and location are required" });
    // }

    //  // Further debug points
    //  console.log('User:', req.user); // Ensure `req.user` exists
    //  console.log('Processing cart data:', req.user.id);

    // if (paymentMethod === 'mobile_money' && (!transaction_id || transaction_id.trim() === '')) {
    //     return res.status(400).json({ success: false, message: "Transaction ID is required for mobile money payments" });
    // }

    // let cartTotal = 0;
    // const cartProducts = [];

    // for (const [itemId, quantity] of Object.entries(userData.cartData)) {
    //     try {
    //         if (!mongoose.Types.ObjectId.isValid(itemId)) {
    //             console.warn(`Skipping invalid product ID: ${itemId}`);
    //             continue; // Skip invalid product ID
    //         }
    //         const product = await Product.findOne({ _id: mongoose.Types.ObjectId(itemId) });
    //         if (!product) {
    //             throw new Error(`Product not found for ID: ${itemId}`);
    //         }

    //         cartTotal += product.price * quantity;
    //         cartProducts.push({ product, quantity });
    //     } catch (error) {
    //         console.error('Error processing cart item:', error.message);
    //         return res.status(400).json({ success: false, message: error.message });
    //     }
    // }

    // if (paymentMethod === 'mobile_money' && cartTotal !== amount) {
    //     return res.status(400).json({ success: false, message: "The payment amount must equal the cart total for mobile money transactions" });
    // }

    // Save the order
    const newOrder = new Order({
      userId: req.user.id,
      cartData: req.body.cartData.map(({ _id, quantity }) => ({
        product: _id,
        quantity,
      })),
      phone,
      location,
      totalAmount: amount,
      paymentMethod,
      transaction_id:
        paymentMethod === "cash_on_delivery" ? null : transaction_id,
      status: "Pending",
      date: new Date(),
    });

    await newOrder.save();

    // userData.phone = phone;
    // userData.location = location;
    // await userData.save();

    res.json({
      success: true,
      message: "Checkout successful",
      deliveryContact: "+256 789 123 456",
    });
  } catch (error) {
    console.error("Error in checkout:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Checkout failed",
        error: error.message,
        stack: error.stack,
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
