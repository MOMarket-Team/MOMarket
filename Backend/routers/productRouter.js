const ProductRouter = require("express").Router();
const productsController = require("../controllers/productsControllers");

ProductRouter.get("/allproducts", productsController.getAllProducts);

ProductRouter.get("/newcollections", productsController.getNewCollection);

ProductRouter.get("/popularinfruit", productsController.getPopularInFruit);

ProductRouter.post("/removeproduct", productsController.remove_product);

ProductRouter.post("/addproduct", productsController.postProduct);

ProductRouter.post("/updateproduct", productsController.updateProduct);

ProductRouter.get("/search", productsController.searchProduct);

ProductRouter.get("/:category", productsController.getProductByCategory);

module.exports = ProductRouter;
