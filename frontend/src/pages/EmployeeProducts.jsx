import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const EmployeeProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/employee/products");
        setProducts(res.data);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading products...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Available Products</h2>

      {products.length === 0 ? (
        <p className="text-center text-muted">No products available</p>
      ) : (
        <div className="row g-4">
          {products.map((product) => (
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

                  <p className="fw-bold mb-1">₹{product.price}</p>

                  <p className="mb-1">
                    <strong>Available Stock:</strong>{" "}
                    <span className="text-success">
                      {product.stock ?? 0}
                    </span>
                  </p>

                  {product.category && (
                    <p className="text-primary mb-0">
                      Category: {product.category.name || product.category}
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
