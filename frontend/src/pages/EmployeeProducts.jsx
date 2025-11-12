import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const EmployeeProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/employee/products");
        setProducts(res.data);
        setFilteredProducts(res.data);

        const uniqueCategories = [
          ...new Set(
            res.data.map((p) =>
              typeof p.category === "object" ? p.category.name : p.category
            )
          ),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchName.trim() !== "") {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (selectedCategory !== "") {
      filtered = filtered.filter(
        (product) =>
          (typeof product.category === "object"
            ? product.category.name
            : product.category) === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  }, [searchName, selectedCategory, products]);

  if (loading) return <p className="text-center mt-4">Loading products...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Available Products</h2>

      <div className="row mb-4">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by product name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-2">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-muted">No products found</p>
      ) : (
        <div className="row g-4">
          {filteredProducts.map((product) => (
            <div key={product._id} className="col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm border-0">
                {product.image && (
                  <div
                    className="overflow-hidden"
                    style={{
                      height: "200px",
                      borderTopLeftRadius: "0.5rem",
                      borderTopRightRadius: "0.5rem",
                    }}
                  >
                    <img
                      src={`http://localhost:3000/uploads/${product.image}`}
                      alt={product.name}
                      className="w-100 h-100"
                      style={{
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    />
                  </div>
                )}

                <div className="card-body">
                  <h5 className="card-title fw-semibold">{product.name}</h5>
                  <p className="card-text text-muted">{product.description}</p>

                  <p className="fw-bold mb-1">${product.price}</p>

                  <p className="mb-1">
                    <strong>Available Stock:</strong>{" "}
                    <span className="text-success">
                      {product.stock ?? 0}
                    </span>
                  </p>

                  {product.category && (
                    <p className="text-primary mb-0">
                      Category:{" "}
                      {typeof product.category === "object"
                        ? product.category.name
                        : product.category}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeProducts;
