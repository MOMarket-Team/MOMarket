import React, { useContext } from 'react';
import './ProductDisplay.css';
import star_icon from '../Assets/star_icon.png';
import star_dull_icon from '../Assets/star_dull_icon.png';
import { ProductContext } from '../../Context/ProductContext';
import prodprice from '../../../utils/priceformat';

const ProductDisplay = (props) => {
    const { product } = props;
    const { addTocart } = useContext(ProductContext);

    // Handle undefined product gracefully
    if (!product) {
        return (
            <div className="productdisplay">
                <p>Loading product details...</p>
            </div>
        );
    }

    return (
        <div className="productdisplay">
            <div className="left">
                <div className="img-list">
                    <img src={product.image} alt="Product Thumbnail 1" />
                    <img src={product.image} alt="Product Thumbnail 2" />
                    <img src={product.image} alt="Product Thumbnail 3" />
                    <img src={product.image} alt="Product Thumbnail 4" />
                </div>
                <div className="display-img">
                    <img className="main-img" src={product.image} alt="Product" />
                </div>
            </div>
            <div className="right">
                <h1>{product.name}</h1>
                <div className="right-star">
                    <img src={star_icon} alt="Star Rating 1" />
                    <img src={star_icon} alt="Star Rating 2" />
                    <img src={star_icon} alt="Star Rating 3" />
                    <img src={star_icon} alt="Star Rating 4" />
                    <img src={star_dull_icon} alt="Star Rating 5" />
                    <p>(111)</p>
                </div>
                <div className="right-prices">
                    <div className="price">{prodprice.format(product.price)}</div>
                </div>
                <div className="description">
                    Best foods for life and strength
                </div>
                <button onClick={() => addTocart(product.id)}>ADD TO CART</button>
                <p className="right-category"><span>Category :</span> Fruits, for life</p>
                <p className="right-category"><span>Tags :</span> Fresh and lively</p>
            </div>
        </div>
    );
};

export default ProductDisplay;