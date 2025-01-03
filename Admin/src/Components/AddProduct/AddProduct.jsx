import { useState } from "react";
import "./AddProduct.css";
import upload from "../../assets/upload.jpg";

const AddProduct = () => {
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "Fruits",
    price: "",
  });

  const detailHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const [image, setImage] = useState(null);
  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const Add_product = async () => {
    console.log(productDetails);

    let responseData;
    let product = productDetails;

    let formData = new FormData();
    formData.append("product", image);

    try {
      const response = await fetch("http://localhost:4000/uploads", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
      responseData = await response.json();
      console.log("Server Response:", responseData);

      if (responseData.success) {
        product.image = responseData.image_url;
        console.log("Image URL:", responseData.image_url); // Log the image URL for debugging

        const addProductResponse = await fetch(
          "http://localhost:4000/api/products/addproduct",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(product),
          }
        );
        const addProductData = await addProductResponse.json();
        addProductData.success ? alert("Product Added") : alert("Failed");
      } else {
        console.error(
          "Upload failed:",
          responseData ? responseData.message : "No response data"
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="addproduct">
      <div className="itemfield">
        <p>Product title</p>
        <input
          value={productDetails.name}
          onChange={detailHandler}
          type="text"
          name="name"
          placeholder="Type here"
        />
      </div>
      <div className="itemfield">
        <div className="itemfield">
          <p>Price</p>
          <input
            value={productDetails.price}
            onChange={detailHandler}
            type="text"
            name="price"
            placeholder="Type here"
          />
        </div>
      </div>
      <div className="itemfield">
        <p>Product category</p>
        <select
          value={productDetails.category}
          onChange={detailHandler}
          name="category"
          className="add-product-selector"
        >
          <option value="Fruits">Fruits</option>
          <option value="Foods">Foods</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Sauce">Sauce</option>
          <option value="Spices">Spices</option>
        </select>
      </div>
      <div className="itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload}
            alt=""
            className="upload-img"
          />
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name="image"
          id="file-input"
          hidden
        />
      </div>
      <button onClick={Add_product} className="add-btn">
        ADD
      </button>
    </div>
  );
};

export default AddProduct;
