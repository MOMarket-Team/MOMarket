const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const dbInstanceConnection = require("./db/dbInstance");
const ProductRouter = require("./routers/productRouter");
const UserRouter = require("./routers/userRouter");
const CartRouter = require("./routers/cartRouter");
const OrderRouter = require("./routers/orderRouter");

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());
app.use(ProductRouter);
app.use(UserRouter);
app.use(CartRouter);
app.use(OrderRouter);

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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});