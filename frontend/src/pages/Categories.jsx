import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState("");

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/organization-admin/categories");
        setCategories(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // ✅ Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/organization-admin/categories/${editingId}`, form);
        setNotification("✅ Category updated successfully!");
      } else {
        await api.post("/organization-admin/categories", form);
        setNotification("✅ Category created successfully!");
      }
      setForm({ name: "", description: "" });
      setEditingId(null);
      const res = await api.get("/organization-admin/categories");
      setCategories(res.data);
    } catch (error) {
      setNotification(error.response?.data?.message || "❌ Error occurred");
    }
  };

  // ✅ Edit category
  const handleEdit = (category) => {
    setForm({ name: category.name, description: category.description });
    setEditingId(category._id);
  };

  // ✅ Delete category
  const handleDelete = async (id) => {
    try {
      await api.delete(`/organization-admin/categories/${id}`);
      setNotification("🗑️ Category deleted successfully!");
      setCategories(categories.filter((cat) => cat._id !== id));
    } catch (error) {
      setNotification(error.response?.data?.message || "❌ Error occurred");
    }
  };

  return (
    <div className="container py-4">
      {/* ✅ Heading + Notification in flex */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">📂 Manage Categories</h2>
        {notification && (
          <div
            className="alert alert-info shadow-sm mb-0"
            style={{ minWidth: "250px" }}
          >
            {notification}
          </div>
        )}
      </div>

      {/* ✅ Form */}
      <div className="card p-3 mb-4 shadow-sm rounded-3">
        <h5 className="mb-3 fw-semibold">
          {editingId ? "✏️ Update Category" : "➕ Add New Category"}
        </h5>
        <form onSubmit={handleSubmit} className="row g-2">
          <div className="col-md-4">
            <input
              type="text"
              name="name"
              placeholder="Category Name"
              value={form.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-2 d-grid">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>

      {/* ✅ Categories List */}
      <h5 className="mb-3 fw-semibold">👀 See All Categories</h5>
      {categories.length === 0 ? (
        <p className="text-muted">No categories available.</p>
      ) : (
        <div className="row">
          {categories.map((category) => (
            <div key={category._id} className="col-md-4 mb-3">
              <div className="card shadow-sm rounded-3 h-100 border-0 hover-shadow">
                <div className="card-body">
                  <h5 className="card-title text-primary">{category.name}</h5>
                  <p className="card-text text-muted">
                    {category.description || "No description"}
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(category)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(category._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
