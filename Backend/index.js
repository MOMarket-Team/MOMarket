const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const dbInstanceConnection = require("./db/dbInstance");
const upload = require("./middleware/multer");

// const client = twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');

dbInstanceConnection();

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/api/products", require("./routers/productRouter"));
app.use("/api/orders", require("./routers/orderRouter"));
app.use("/api/users", require("./routers/usersRouter"));

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
