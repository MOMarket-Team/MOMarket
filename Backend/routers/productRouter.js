const { allProducts, newCollections, popularinfruit, removeproduct, addproduct } = require('../controllers/productController');
const Product = require('../model/productModel');

const ProductRouter = require('express').Router()


ProductRouter.get('/allproducts', allProducts);

ProductRouter.get('/newcollections', newCollections);

ProductRouter.get('/popularinfruit', popularinfruit);

ProductRouter.post('/removeproduct', removeproduct);

ProductRouter.post('/addproduct', addproduct);


module.exports = ProductRouter
