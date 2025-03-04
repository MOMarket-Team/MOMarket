import React, { useState } from 'react';
import './AddProduct.css';
import upload from '../../assets/upload.jpg';

const AddProduct = () => {
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "Fruits",
    price: "",
    measurement: "Kgs", // Default to "Kgs"
    sizeOptions: {}, // For "Whole" products
    basePrice: 0, // For "Set" products
  });

  const [image, setImage] = useState(null);

  const detailHandler = (e) => {
    const { name, value } = e.target;
    setProductDetails({ ...productDetails, [name]: value });
  };

  const sizeOptionHandler = (size, price) => {
    setProductDetails({
      ...productDetails,
      sizeOptions: { ...productDetails.sizeOptions, [size]: price },
    });
  };

  const Add_product = async () => {
    let formData = new FormData();
    formData.append('product', image);

    try {
      // Upload image
      const uploadResponse = await fetch('https://momarket-7ata.onrender.com/uploads', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      const uploadData = await uploadResponse.json();

      if (uploadData.success) {
        productDetails.image = uploadData.image_url;

        // Add product
        const addProductResponse = await fetch('https://momarket-7ata.onrender.com/addproduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productDetails),
        });

        const addProductData = await addProductResponse.json();
        addProductData.success
          ? alert("Product Added Successfully")
          : alert("Failed to Add Product");
      }
    } catch (error) {
      console.error("Error during product addition:", error);
    }
  };

  return (
    <div className='addproduct'>
      <div className="itemfield">
        <p>Product title</p>
        <input value={productDetails.name} onChange={detailHandler} type="text" name='name' placeholder='Type here' />
      </div>
      <div className="itemfield">
        <p>Price</p>
        <input value={productDetails.price} onChange={detailHandler} type="text" name='price' placeholder='Type here' />
      </div>
      <div className="itemfield">
        <p>Product category</p>
        <select value={productDetails.category} onChange={detailHandler} name="category">
          <option value="Fruits">Fruits</option>
          <option value="Foods">Foods</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Sauce">Sauce</option>
          <option value="Spices">Spices</option>
        </select>
      </div>
      <div className="itemfield">
        <p>Measurement</p>
        <select value={productDetails.measurement} onChange={detailHandler} name="measurement">
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
            onChange={(e) => sizeOptionHandler("small", e.target.value)}
          />
          <input
            type="number"
            placeholder="Medium Price"
            onChange={(e) => sizeOptionHandler("medium", e.target.value)}
          />
          <input
            type="number"
            placeholder="Big Price"
            onChange={(e) => sizeOptionHandler("big", e.target.value)}
          />
        </div>
      )}
      <div className="itemfield">
        <label htmlFor="file-input">
          <img src={image ? URL.createObjectURL(image) : upload} alt="" className='upload-img' />
        </label>
        <input onChange={(e) => setImage(e.target.files[0])} type="file" id='file-input' hidden />
      </div>
      <button onClick={Add_product} className='add-btn'>ADD</button>
    </div>
  );
};

export default AddProduct;