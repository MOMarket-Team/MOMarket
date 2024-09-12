const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const dbInstanceConnection = require("./db/dbInstance");
const Users = require("./model/userModel");
const Product = require("./model/productModel");
const Router = require("./routers/productRouter");
const ProductRouter = require("./routers/productRouter");
// const Router = require("./routers/router");

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());
app.use(ProductRouter)

dbInstanceConnection()


// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: './uploads/images',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

app.use('/images', express.static('uploads/images'));

app.get("/", (req, res) => {
    res.send("Express App is Running");
});

app.post("/uploads", upload.single('product'), (req, res) => {
    res.json({ success: 1, image_url: `http://localhost:${port}/images/${req.file.filename}` });
});

// Authentication middleware
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send({ errors: "Please authenticate using a valid token" });

    try {
        const data = jwt.verify(token, 'secret_ecom');
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
};

// Middleware to ensure cart is not empty
const ensureCartNotEmpty = (req, res, next) => {
    Users.findById(req.user.id)
        .then(userData => {
            if (!userData || !userData.cartData || Object.values(userData.cartData).every(item => item === 0)) {
                return res.status(400).json({ success: false, message: 'Cart is empty.' });
            }
            next();
        })
        .catch(err => {
            console.error('Error fetching user data:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        });
};

// Routes for product operations

// Routes for user authentication
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "existing email address" });
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
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token });
});

app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = { user: { id: user.id } };
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        } else {
            res.json({ success: false, errors: "Wrong Password" });
        }
    } else {
        res.json({ success: false, errors: "wrong Email Id" });
    }
});

// Fetch customer details
app.get('/customer', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (user) {
            res.json({ success: true, customer: { email: user.email, name: user.name } });
        } else {
            res.json({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

// Routes for cart operations
app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findById(req.user.id);
        if (!userData) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        userData.cartData[req.body.itemId] += 1;
        await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
        res.json({ message: "Added" });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add to cart', error });
    }
});

app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findById(req.user.id);
        if (!userData) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (userData.cartData[req.body.itemId] > 0) {
            userData.cartData[req.body.itemId] -= 1;
        }
        await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
        res.json({ message: "Removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to remove from cart', error });
    }
});

// Checkout route with Flutterwave integration
app.post('/checkout', fetchUser, ensureCartNotEmpty, async (req, res) => {
    try {
        const { phone, location, paymentMethod, amount, transaction_id } = req.body;
        let userData = await Users.findById(req.user.id);

        if (!phone || !location) {
            return res.status(400).json({ success: false, message: "Phone number and location are required" });
        }

        // Calculate cart total
        let cartTotal = 0;
        for (const [itemId, quantity] of Object.entries(userData.cartData)) {
            if (quantity > 0) {
                const product = await Product.findOne({ id: itemId });
                cartTotal += product.price * quantity;
            }
        }

        if (paymentMethod === 'mobile_money' && cartTotal !== amount) {
            return res.status(400).json({ success: false, message: "The payment amount must equal the cart total for mobile money transactions" });
        }

        // Update user data with phone and location
        userData.phone = phone;
        userData.location = location;
        await userData.save();

        res.json({ success: true, message: "Checkout successful", deliveryContact: "+256 789 123 456" });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Checkout failed', error });
    }
});
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const secret = 'FLWSECK_TEST-301513cfe5479f53a8fee5fcf0416b5a-X';
    const hash = req.headers['verif-hash'];

    if (!hash) {
        return res.status(400).send('No hash provided');
    }

    const calculatedHash = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');

    if (hash !== calculatedHash) {
        return res.status(400).send('Invalid hash');
    }

    // Process the payment
    const paymentData = JSON.parse(req.body);

    // Validate the payment data and update order status in your database
    if (paymentData.status === 'successful') {
        // Update order as paid
        // Example: const orderId = paymentData.data.order_id;
        // Update order status in your database
    }

    res.status(200).send('Webhook received');
});
app.post('/clearcart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findById(req.user.id);
        if (!userData) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const defaultCart = {};
        for (let i = 0; i < 300; i++) {
            defaultCart[i] = 0;
        }

        userData.cartData = defaultCart;
        await userData.save();
        res.json({ success: true, message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to clear cart', error });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});