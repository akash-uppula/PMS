import React, { useState, useEffect, useRef } from "react";
import api from "../api/axiosInstance";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    image: null,
    maxDiscount: "",
  });
  const [stockChange, setStockChange] = useState({});
  const [activeStockAction, setActiveStockAction] = useState({});
  const [toast, setToast] = useState({ message: "", type: "" });
  const containerRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 2500);
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/organization-admin/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch products", "danger");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/organization-admin/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch categories", "danger");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm({ ...form, [name]: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: "",
      categoryId: product.category?._id || "",
      image: null,
      maxDiscount: product.maxDiscount || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null && form[key] !== "") {
          formData.append(key, form[key]);
        }
      });

      if (editingProduct) {
        await api.put(
          `/organization-admin/products/${editingProduct._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        showToast("Product updated successfully");
      } else {
        await api.post("/organization-admin/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Product added successfully");
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast("Failed to save product", "danger");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
      image: null,
      maxDiscount: "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await api.delete(`/organization-admin/products/${id}`);
      showToast("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete product", "danger");
    }
  };

  const handleStockChange = (productId, value) => {
    setStockChange({ ...stockChange, [productId]: value });
  };

  const toggleStockInput = (productId, action) => {
    setActiveStockAction({
      [productId]: activeStockAction[productId] === action ? null : action,
    });
    setStockChange({ ...stockChange, [productId]: "" });
  };

  const addStock = async (id) => {
    const qty = Number(stockChange[id]);
    if (isNaN(qty) || qty <= 0) return showToast("Invalid quantity", "danger");

    try {
      await api.put(`/organization-admin/products/add-stock/${id}`, {
        quantity: qty,
      });
      showToast("Stock added successfully");
      setStockChange({ ...stockChange, [id]: "" });
      setActiveStockAction({});
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast("Failed to add stock", "danger");
    }
  };

  const removeStock = async (id, availableStock) => {
    const qty = Number(stockChange[id]);
    if (isNaN(qty) || qty <= 0) return showToast("Invalid quantity", "danger");
    if (qty > availableStock)
      return showToast("Cannot remove more than available stock", "danger");

    try {
      await api.put(`/organization-admin/products/remove-stock/${id}`, {
        quantity: qty,
      });
      showToast("Stock removed successfully");
      setStockChange({ ...stockChange, [id]: "" });
      setActiveStockAction({});
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast("Failed to remove stock", "danger");
    }
  };

  // ✅ Auto-close floating inputs when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".stock-input-container")) {
        setActiveStockAction({});
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="container py-4" ref={containerRef}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Products</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Product
        </button>
      </div>

      <div className="row g-3">
        {products.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h4 className="text-muted">😕 No products found</h4>
            <p className="text-muted">
              Start building your catalog by adding products.
            </p>
          </div>
        ) : (
          products.map((p) => (
            <div key={p._id} className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-shadow transition">
                {p.image && (
                  <img
                    src={`http://localhost:3000/uploads/${p.image}`}
                    className="card-img-top"
                    alt={p.name}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title fw-semibold">{p.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {p.category?.name}
                  </h6>
                  <p className="card-text small">
                    <strong>Price:</strong> ${p.price} <br />
                    <strong>Stock:</strong> {p.stock} <br />
                    <strong>Max Discount:</strong> {p.maxDiscount || 0}% <br />
                    {p.description && <span>{p.description}</span>}
                  </p>

                  <div className="d-flex flex-wrap gap-2 mt-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStockInput(p._id, "add");
                      }}
                    >
                      Add
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStockInput(p._id, "remove");
                      }}
                    >
                      Remove
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p._id)}
                    >
                      Delete
                    </button>
                  </div>

                  {/* Floating stock input */}
                  {activeStockAction[p._id] && (
                    <div
                      className="position-absolute bg-white border rounded p-2 shadow-sm stock-input-container"
                      style={{
                        top: "40%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 10,
                        minWidth: "180px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="input-group input-group-sm">
                        <input
                          type="number"
                          className="form-control text-center"
                          placeholder="Qty"
                          min="1"
                          max={
                            activeStockAction[p._id] === "remove"
                              ? p.stock
                              : undefined
                          }
                          value={stockChange[p._id] || ""}
                          onChange={(e) =>
                            handleStockChange(p._id, e.target.value)
                          }
                        />
                        <button
                          className={`btn ${
                            activeStockAction[p._id] === "add"
                              ? "btn-success"
                              : "btn-warning"
                          }`}
                          onClick={() =>
                            activeStockAction[p._id] === "add"
                              ? addStock(p._id)
                              : removeStock(p._id, p.stock)
                          }
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ overflowY: "auto", maxHeight: "100vh" }} // ✅ allow scrolling
        >
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingProduct ? "Edit Product" : "Add Product"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div
                  className="modal-body"
                  style={{ maxHeight: "70vh", overflowY: "auto" }} // ✅ scroll inside modal body
                >
                  {[
                    { label: "Product Name", name: "name", type: "text" },
                    { label: "Price", name: "price", type: "number" },
                    {
                      label: "Max Discount (%)",
                      name: "maxDiscount",
                      type: "number",
                    },
                  ].map((field) => (
                    <div className="mb-3" key={field.name}>
                      <label className="form-label">{field.label}</label>
                      <input
                        type={field.type}
                        className="form-control"
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  ))}

                  {!editingProduct && (
                    <div className="mb-3">
                      <label className="form-label">Initial Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        name="stock"
                        value={form.stock}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Image</label>
                    <input
                      type="file"
                      className="form-control"
                      name="image"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop fade show"></div>}

      {/* Bootstrap Toast */}
      {toast.message && (
        <div
          className={`toast align-items-center text-bg-${toast.type} border-0 position-fixed bottom-0 end-0 m-4 show`}
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
