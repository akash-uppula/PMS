// src/pages/ViewDraftQuotations.jsx
import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const ViewDraftQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchDraftQuotations();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 1500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/employee/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
  };

  const fetchDraftQuotations = async () => {
    try {
      const res = await api.get("/employee/quotations");
      const drafts = res.data.data.filter((q) => q.status === "Draft");
      setQuotations(drafts);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch draft quotations.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q) => {
    setEditingQuotation(q);
    setCustomer(q.customer || { name: "", email: "", phone: "" });
    const mappedItems = (q.items || []).map((item) => ({
      _id: item._id,
      product:
        typeof item.product === "object" ? item.product._id : item.product,
      quantity: item.quantity || 1,
      discount: item.discount || 0,
    }));
    setItems(mappedItems);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuotation(null);
    setCustomer({ name: "", email: "", phone: "" });
    setItems([]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] =
      field === "quantity" || field === "discount" ? Number(value) : value;
    setItems(updated);
  };

  const addItem = () =>
    setItems([...items, { product: "", quantity: 1, discount: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleUpdate = async () => {
    if (!editingQuotation) return;
    try {
      const itemsToAdd = items.filter((i) => !i._id);
      const itemsToUpdate = items.filter((i) => i._id);
      const originalIds = (editingQuotation.items || []).map((i) => i._id);
      const currentIds = itemsToUpdate.map((i) => i._id);
      const itemsToDelete = originalIds.filter(
        (id) => !currentIds.includes(id)
      );

      await api.put(`/employee/quotations/${editingQuotation._id}`, {
        customer,
        itemsToAdd,
        itemsToUpdate,
        itemsToDelete,
      });

      setMessage("✅ Draft updated successfully!");
      closeModal();
      fetchDraftQuotations();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update draft quotation");
    }
  };

  const handleDelete = async (_id) => {
    try {
      await api.delete(`/employee/quotations/${_id}`);
      setMessage("✅ Draft deleted successfully!");
      fetchDraftQuotations();
    } catch (err) {
      setMessage(
        err.response?.data?.message || "❌ Failed to delete draft quotation"
      );
    }
  };

  const calculateTotal = () => {
    return items
      .reduce((sum, item) => {
        const product = products.find((p) => p._id === item.product);
        if (!product) return sum;
        const discount = Math.min(
          item.discount || 0,
          product.maxDiscount || 100
        );
        const finalPrice =
          (product.price - (product.price * discount) / 100) * item.quantity;
        return sum + finalPrice;
      }, 0)
      .toFixed(2);
  };

  if (loading)
    return <p className="text-center mt-4">Loading draft quotations...</p>;
  if (quotations.length === 0)
    return (
      <div className="container py-4 d-flex flex-column align-items-center">
        <h2 className="mb-4 text-center">Draft Quotations</h2>
        <div className="text-center" style={{ maxWidth: "600px" }}>
          <p className="text-secondary fs-6">
            You don’t have any draft quotations yet.
            <br />
            Once you start creating quotations, they will appear here for easy
            tracking and management.
          </p>
        </div>
      </div>
    );

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Draft Quotations</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <div className="row g-3">
        {quotations.map((q) => (
          <div key={q._id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{q.customer?.name}</h5>
                {q.customer?.email && <p>📧 {q.customer.email}</p>}
                {q.customer?.phone && <p>📞 {q.customer.phone}</p>}
                <p className="fw-bold">
                  Total: ${q.totalAmount?.toFixed(2) || 0}
                </p>
                <span className="badge bg-secondary">{q.status}</span>

                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-secondary flex-grow-1"
                    onClick={() => handleEdit(q)}
                  >
                    View/Edit
                  </button>
                  <button
                    className="btn btn-danger flex-grow-1"
                    onClick={() => handleDelete(q._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Draft Quotation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <h6 className="fw-bold">Customer Details</h6>
                <input
                  className="form-control mb-2"
                  placeholder="Name"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                />
                <input
                  className="form-control mb-2"
                  placeholder="Email"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                />
                <input
                  className="form-control mb-2"
                  placeholder="Phone"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                />

                <h6 className="fw-bold mt-4">Items</h6>
                {/* Headings */}
                <div className="row fw-bold text-center mb-2">
                  <div className="col-md-6">Product</div>
                  <div className="col-md-2">Quantity</div>
                  <div className="col-md-2">Discount (%)</div>
                  <div className="col-md-2">Actions</div>
                </div>

                {/* Item Rows */}
                {items.map((item, index) => {
                  const product = products.find((p) => p._id === item.product);
                  const maxDiscount = product?.maxDiscount || 100;

                  const availableProducts = products.filter(
                    (p) =>
                      p._id === item.product ||
                      !items.some(
                        (i, idx) => i.product === p._id && idx !== index
                      )
                  );

                  return (
                    <div
                      key={index}
                      className="row mb-2 align-items-center text-center"
                    >
                      <div className="col-md-6">
                        <select
                          className="form-select"
                          value={item.product}
                          onChange={(e) =>
                            handleItemChange(index, "product", e.target.value)
                          }
                          required
                        >
                          <option value="" disabled>
                            Select Product
                          </option>
                          {availableProducts.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} - ${p.price}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-2">
                        <input
                          type="number"
                          className="form-control"
                          value={item.quantity}
                          min={1}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                        />
                      </div>

                      <div className="col-md-2">
                        <input
                          type="number"
                          className="form-control"
                          value={item.discount}
                          min={0}
                          max={maxDiscount}
                          onChange={(e) => {
                            let value = Number(e.target.value);
                            if (value > maxDiscount) value = maxDiscount;
                            handleItemChange(index, "discount", value);
                          }}
                        />
                      </div>

                      <div className="col-md-2">
                        <button
                          className="btn btn-danger"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button className="btn btn-primary mb-2" onClick={addItem}>
                  Add Item
                </button>
                <p className="fw-bold text-end">Total: ${calculateTotal()}</p>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleUpdate}>
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDraftQuotations;
