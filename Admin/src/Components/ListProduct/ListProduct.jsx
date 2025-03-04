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
    await fetch('https://momarket-7ata.onrender.com/removeproduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id }), // Use _id instead of id
    });
    await fetchInfo();
  };

  const updateProduct = async () => {
    if (!editProduct || !editProduct._id) { // Use _id instead of id
      console.error("Edit product is missing ID or is undefined");
      return;
    }

    console.log("Updating product with payload:", editProduct);

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
      await fetchInfo();
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
            {editProduct && editProduct._id === product._id ? ( // Use _id instead of id
              <>
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
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                />
                <input
                  type="number"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                />
                <select
                  value={editProduct.category}
                  onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={editProduct.measurement || "Kgs"}
                  onChange={(e) => {
                    const newMeasurement = e.target.value;
                    console.log("Selected measurement:", newMeasurement);

                    const updatedProduct = { ...editProduct, measurement: newMeasurement };
                    if (newMeasurement === "Whole") {
                      updatedProduct.sizeOptions = { small: 0, medium: 0, big: 0 };
                    } else if (newMeasurement === "Set") {
                      updatedProduct.basePrice = 0;
                    } else {
                      delete updatedProduct.sizeOptions;
                      delete updatedProduct.basePrice;
                    }

                    setEditProduct(updatedProduct);
                  }}
                >
                  <option value="Kgs">Kgs</option>
                  <option value="Whole">Whole</option>
                  <option value="Set">Set</option>
                </select>
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
                  <img onClick={() => remove_product(product._id)} src={cross_icon} alt="Remove" className="remove-icon" /> {/* Use _id instead of id */}
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