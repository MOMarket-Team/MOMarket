import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cart_cross_icon.png';

const ListProduct = () => {
    const [allProducts, setAllProducts] = useState([]);

    const fetchInfo = async () => {
        try {
            const res = await fetch('http://localhost:4000/allproducts');
            const data = await res.json();
            console.log('Fetched Products:', data);
            setAllProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    useEffect(() => {
        fetchInfo();
    }, []);

    // for remove API
    const remove_product = async (id)=>{
      await fetch('http://localhost:4000/removeproduct',{
        method:'POST',
        headers:{
          Accept:'application/json',
          'Content-Type':'application/json',
        },
        body:JSON.stringify({id:id})
      })
      await fetchInfo();
    }

    return (
        <div className='listproduct'>
            <h1>All Products List</h1>
            <div className="listproduct-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Price</p>
                <p>Category</p>
                <p>Remove</p>
            </div>
            <div className="listproduct-allproducts">
                <hr />
                {allProducts.map((product, index) => {
                    console.log('Product:', product);
                    return <>
                        <div className="listproduct-format-main listproduct-format" key={index}>
                            <img src={product.image} alt="" className="listproduct-product-icon" />
                            <p>{product.name}</p>
                            <p>${product.price}</p>
                            <p>{product.category}</p>
                            <img  onClick={()=>{remove_product(product.id)}} src={cross_icon} alt="" className="remove-icon" />
                        </div>
                        <hr />
                        </>
                })}
            </div>
        </div>
    )
}

export default ListProduct;
