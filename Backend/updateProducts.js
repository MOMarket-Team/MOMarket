const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://khabertkcca:Khabert%2311@cluster0.mzb08dh.mongodb.net/kcca_online_marketing", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Product = mongoose.model("Product", {
  id: Number,
  name: String,
  image: String,
  category: String,
  price: Number,
  date: Date,
  available: Boolean,
});

async function updateImageUrlsAndResetIds() {
  const products = await Product.find({});

  let idCounter = 1;

  for (let product of products) {
    if (product.image.includes("&{port}")) {
      product.image = product.image.replace("&{port}", "4000");
    }

    product.id = idCounter.toString().padStart(4, '0');
    await product.save();

    idCounter++;
  }

  console.log("Updated image URLs and reset IDs");
}

updateImageUrlsAndResetIds().then(() => mongoose.disconnect());