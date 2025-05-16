import React, { useState } from 'react';
import './AddProduct.css';
import upload from '../../assets/upload.jpg';

const AddProduct = () => {
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "Fruits",
    price: "",
    measurement: "Kgs",
    sizeOptions: {},
    basePrice: "",
  });

  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detailHandler = (e) => {
    const { name, value } = e.target;
    setProductDetails(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const sizeOptionHandler = (size, price) => {
    setProductDetails(prev => ({
      ...prev,
      sizeOptions: { 
        ...prev.sizeOptions, 
        [size]: price 
      },
    }));
  };

  const Add_product = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    if (!image) {
      alert("Please select an image first");
      setIsSubmitting(false);
      return;
    }
  
    let formData = new FormData();
    formData.append('product', image);
  
    try {
      // 1. Upload image
      const uploadResponse = await fetch('https://mangumarket.up.railway.app/uploads', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error("Image upload failed");
      }
  
      const uploadData = await uploadResponse.json();
  
      if (!uploadData.success) {
        throw new Error(uploadData.message || "Image upload failed");
      }
  
      // 2. Prepare product data with proper types
      const productData = {
        name: productDetails.name,
        image: uploadData.image_url,
        category: productDetails.category,
        measurement: productDetails.measurement,
        price: productDetails.measurement === "Set" ? productDetails.basePrice : productDetails.price,
        basePrice: productDetails.measurement === "Set" ? productDetails.basePrice : 0,
        sizeOptions: productDetails.sizeOptions
      };
  
      // 3. Add product
      const addProductResponse = await fetch('https://mangumarket.up.railway.app/addproduct', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData),
      });
  
      const responseData = await addProductResponse.json();
      
      if (!addProductResponse.ok) {
        throw new Error(responseData.message || "Failed to add product");
      }
  
      if (responseData.success) {
        alert("Product Added Successfully");
        // Reset form
        setProductDetails({
          name: "",
          image: "",
          category: "Fruits",
          price: "",
          measurement: "Kgs",
          sizeOptions: {},
          basePrice: "",
        });
        setImage(null);
      } else {
        throw new Error(responseData.message || "Failed to Add Product");
      }
    } catch (error) {
      console.error("Error during product addition:", error);
      alert(error.message || "An error occurred while adding the product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='addproduct'>
      <div className="itemfield">
        <p>Product title</p>
        <input 
          value={productDetails.name} 
          onChange={detailHandler} 
          type="text" 
          name='name' 
          placeholder='Type here' 
          required
        />
      </div>
      
      {productDetails.measurement !== "Whole" && (
        <div className="itemfield">
          <p>{productDetails.measurement === "Set" ? "Set Price" : "Price"}</p>
          <input 
            value={productDetails.measurement === "Set" ? productDetails.basePrice : productDetails.price} 
            onChange={detailHandler} 
            type="number" 
            name={productDetails.measurement === "Set" ? "basePrice" : "price"} 
            placeholder='Type here' 
            min="0"
            step="0.01"
            required
          />
        </div>
      )}
      
      <div className="itemfield">
        <p>Product category</p>
        <select 
          value={productDetails.category} 
          onChange={detailHandler} 
          name="category"
          required
        >
          <option value="Fruits">Fruits</option>
          <option value="Foods">Foods</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Sauce">Sauce</option>
          <option value="Spices">Spices</option>
        </select>
      </div>
      
      <div className="itemfield">
        <p>Measurement</p>
        <select 
          value={productDetails.measurement} 
          onChange={detailHandler} 
          name="measurement"
          required
        >
          <option value="Kgs">Kgs</option>
          <option value="Whole">Whole</option>
          <option value="Set">Set</option>
        </select>
      </div>

      {productDetails.measurement === "Whole" && (
        <div className="itemfield">
          <p>Size Options</p>
          <input
            type="number"
            placeholder="Small Price"
            min="0"
            step="0.01"
            onChange={(e) => sizeOptionHandler("small", e.target.value)}
          />
          <input
            type="number"
            placeholder="Medium Price"
            min="0"
            step="0.01"
            onChange={(e) => sizeOptionHandler("medium", e.target.value)}
          />
          <input
            type="number"
            placeholder="Big Price"
            min="0"
            step="0.01"
            onChange={(e) => sizeOptionHandler("big", e.target.value)}
          />
        </div>
      )}

      <div className="itemfield">
        <label htmlFor="file-input">
          <img 
            src={image ? URL.createObjectURL(image) : upload} 
            alt="" 
            className='upload-img' 
          />
          <p>{image ? image.name : "Click to upload image"}</p>
        </label>
        <input 
          onChange={(e) => setImage(e.target.files[0])} 
          type="file" 
          id='file-input' 
          hidden 
          accept="image/*"
          required
        />
      </div>
      
      <button 
        onClick={Add_product} 
        className='add-btn'
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adding..." : "ADD"}
      </button>
    </div>
  );
};

export default AddProduct;