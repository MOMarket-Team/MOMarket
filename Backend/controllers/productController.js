const Product = require("../model/productModel");

module.exports = {
    allProducts: async (req, res) => {
        try {
            let products = await Product.find({});
            res.send(products);
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch products', error });
        }
    },
    newCollections: async (req, res) => {
        let products = await Product.find({});
        let newcollection = products.slice(1).slice(-8);
        res.send(newcollection);
    },
    popularinfruit: async (req, res) => {
        let products = await Product.find({ category: "Fruits" });
        let popular_in_fruit = products.slice(0, 4);
        res.send(popular_in_fruit);
    },
    removeproduct: async (req, res) => {
        try {
            await Product.findOneAndDelete({ id: req.body.id });
            res.json({ success: true, name: req.body.name });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to remove product', error });
        }
    },
    addproduct: async (req, res) => {
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
            res.status(500).json({ success: false, message: 'Failed to save product', error });
        }
    }
}