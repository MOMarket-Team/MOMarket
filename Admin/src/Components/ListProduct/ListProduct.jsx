import { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from "../../assets/cart_cross_icon.png";

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [categories, setCategories] = useState([]); // State for existing categories

  const fetchInfo = async () => {
    try {
      const res = await fetch("http://localhost:4000/allproducts");
      const data = await res.json();
      setAllProducts(data);

      // Extract unique categories from products
      const uniqueCategories = [
        ...new Set(data.map((product) => product.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  // API call to remove product
  const remove_product = async (id) => {
    await fetch("http://localhost:4000/removeproduct", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    await fetchInfo();
  };

  // API call to update product
  const updateProduct = async () => {
    await fetch("http://localhost:4000/api/products/updateproduct", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editProduct),
    });
    setEditProduct(null); // Reset editProduct state
    await fetchInfo();
  };

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Category</p>
        <p>Actions</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allProducts.map((product, index) => (
          <div
            className="listproduct-format-main listproduct-format"
            key={index}
          >
            {editProduct && editProduct.id === product.id ? (
              <>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditProduct({
                          ...editProduct,
                          image: reader.result,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                />
                <input
                  type="number"
                  value={editProduct.price}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, price: e.target.value })
                  }
                />
                <select
                  value={editProduct.category}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, category: e.target.value })
                  }
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button onClick={updateProduct}>Save</button>
                <button onClick={() => setEditProduct(null)}>Cancel</button>
              </>
            ) : (
              <>
                <img
                  src={product.image}
                  alt=""
                  className="listproduct-product-icon"
                />
                <p>{product.name}</p>
                <p>${product.price}</p>
                <p>{product.category}</p>
                <div>
                  <button onClick={() => setEditProduct(product)}>Edit</button>
                  <img
                    onClick={() => remove_product(product.id)}
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
