import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cart_cross_icon.png';

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchInfo = async () => {
    try {
      const res = await fetch('https://momarket-7ata.onrender.com/allproducts');
      const data = await res.json();
      console.log("Fetched products:", data);
      setAllProducts(data);
      setCategories([...new Set(data.map(product => product.category))]);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (_id) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      try {
        console.log("Attempting to remove product with ID:", _id); // Debugging
  
        const response = await fetch('https://momarket-7ata.onrender.com/removeproduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to remove product:", errorData);
          return;
        }
  
        const result = await response.json();
        console.log("Product removed successfully:", result);
  
        // Refresh the product list
        await fetchInfo();
      } catch (error) {
        console.error("Error removing product:", error);
      }
    }
  };

  const updateProduct = async () => {
    if (!editProduct || !editProduct._id) {
      console.error("Edit product is missing ID or is undefined");
      return;
    }
  
    console.log("Updating product with payload:", editProduct); // Debugging
  
    try {
      const response = await fetch('https://momarket-7ata.onrender.com/updateproduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update product:", errorData);
        return;
      }
  
      const result = await response.json();
      console.log("Product updated successfully:", result);
  
      setEditProduct(null);
      await fetchInfo(); // Refresh the product list
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className='listproduct'>
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Category</p>
        <p>Measurement</p>
        <p>Actions</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allProducts.map((product, index) => (
          <div className="listproduct-format-main listproduct-format" key={index}>
            {editProduct && editProduct._id === product._id ? (
              <>
                {/* Product Image */}
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditProduct({ ...editProduct, image: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {/* Product Name */}
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                />
                {/* Product Price */}
                <input
                  type="number"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                />
                {/* Product Category */}
                <select
                  value={editProduct.category}
                  onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                {/* Product Measurement */}
                <select
                  value={editProduct.measurement || "Kgs"}
                  onChange={(e) => {
                    const newMeasurement = e.target.value;
                    console.log("Selected measurement:", newMeasurement);

                    const updatedProduct = { ...editProduct, measurement: newMeasurement };
                    if (newMeasurement === "Whole") {
                      updatedProduct.sizeOptions = { small: 0, medium: 0, big: 0 };
                      updatedProduct.sizeImages = { small: "", medium: "", big: "" }; // Initialize size images
                    } else if (newMeasurement === "Set") {
                      updatedProduct.basePrice = 0;
                    } else {
                      delete updatedProduct.sizeOptions;
                      delete updatedProduct.sizeImages;
                      delete updatedProduct.basePrice;
                    }

                    setEditProduct(updatedProduct);
                  }}
                >
                  <option value="Kgs">Kgs</option>
                  <option value="Whole">Whole</option>
                  <option value="Set">Set</option>
                </select>

                {/* Size Options for "Whole" Measurement */}
                {editProduct.measurement === "Whole" && (
                  <div className="size-options">
                    {["small", "medium", "big"].map((size) => (
                      <div key={size} className="size-option">
                        <h4>{size.toUpperCase()}</h4>
                        {/* Price Input */}
                        <input
                          type="number"
                          placeholder={`${size} price`}
                          value={editProduct.sizeOptions[size] || 0}
                          onChange={(e) =>
                            setEditProduct({
                              ...editProduct,
                              sizeOptions: {
                                ...editProduct.sizeOptions,
                                [size]: e.target.value,
                              },
                            })
                          }
                        />
                        {/* Image Upload */}
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditProduct({
                                  ...editProduct,
                                  sizeImages: {
                                    ...editProduct.sizeImages,
                                    [size]: reader.result,
                                  },
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {/* Display Uploaded Image */}
                        {editProduct.sizeImages[size] && (
                          <img
                            src={editProduct.sizeImages[size]}
                            alt={`${size} image`}
                            className="size-image"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Save and Cancel Buttons */}
                <button onClick={updateProduct}>Save</button>
                <button onClick={() => setEditProduct(null)}>Cancel</button>
              </>
            ) : (
              <>
                <img src={product.image} alt="" className="listproduct-product-icon" />
                <p>{product.name}</p>
                <p>UGX{product.price}</p>
                <p>{product.category}</p>
                <p>{product.measurement || "N/A"}</p>
                <div>
                  <button onClick={() => setEditProduct({ ...product })}>Edit</button>
                  <img
                    onClick={() => remove_product(product._id)}
                    src={cross_icon}
                    alt="Remove"
                    className="remove-icon"
                  />
                </div>
              </>
            )}
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;