const Product = require("../model/productModel");

const productsController = {
  getAllProducts: async (req, res) => {
    try {
      let products = await Product.find({});
      res.send(products);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch products", error });
    }
  },
  postProduct: async (req, res) => {
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
  },
  updateProduct: async (req, res) => {
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
  },
  searchProduct: async (req, res) => {
    try {
      const query = req.query.q ? req.query.q.toLowerCase() : "";

      console.log(`Search query: ${query}`);

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
  },
  getProductByCategory: async (req, res) => {
    try {
      const { category } = req.params;
      if (!category) {
        return res
          .status(400)
          .json({ error: "Category parameter is required" });
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
  },
  remove_product: async (req, res) => {
    try {
      await Product.findOneAndDelete({ id: req.body.id });
      res.json({ success: true, name: req.body.name });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to remove product", error });
    }
  },
  getNewCollection: async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    res.send(newcollection);
  },

  getPopularInFruit: async (req, res) => {
    let products = await Product.find({ category: "Fruits" });
    let popular_in_fruit = products.slice(0, 4);
    res.send(popular_in_fruit);
  },
};

module.exports = productsController;
