import React, { useContext } from 'react'
import './CSS/ProductCategory.css'
import { ProductContext } from '../Context/ProductContext'
import dropdown_icon from '../Components/Assets/dropdown_icon.png'
import Item from '../Components/Item/Item'

const ProductsCategory = (props) => {

  const {all_product} = useContext(ProductContext);
  return (
    <div className='product-category'>
      <img className='banner' src={props.banner} alt="" />
      <div className="indexsort">
        <p>
          <span>Showing 1-9</span> out of 36 products
        </p>
        <div className="sort">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>
      <div className="category-products">
        {all_product.map((item,i)=>{
          if (props.category===item.category) {
            return  <Item key={i} id={item.id} 
            name={item.name} image={item.image}
            price={item.price}/>          
          }
          else{
            return null;
          }
        })}
      </div>
      <div className="loadmore">
        Explore More
      </div>
    </div>
  )
}

export default ProductsCategory