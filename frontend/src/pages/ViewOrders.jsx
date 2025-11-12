import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [customerSearch, setCustomerSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, customerSearch]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/employee/orders");
      setOrders(res.data.data || []);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (customerSearch.trim()) {
      filtered = filtered.filter((order) =>
        order.customer?.name
          ?.toLowerCase()
          .includes(customerSearch.trim().toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await api.put(`/employee/orders/cancel/${orderId}`);
      setMessage("✅ Order cancelled successfully!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Failed to cancel order.");
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await api.put(`/employee/orders/complete/${orderId}`);
      setMessage("✅ Order completed successfully!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Failed to complete order.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await api.delete(`/employee/orders/${orderId}`);
      setMessage("🗑️ Order deleted successfully!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Failed to delete order.");
    }
  };

  if (loading) return <p className="text-center mt-4">Loading orders...</p>;

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">My Orders</h2>
      {message && <div className="alert alert-info text-center">{message}</div>}

      <div className="card mb-4 shadow-sm p-3">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Filter by Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Search by Customer</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter customer name..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>

          <div className="col-md-4 text-md-end text-center">
            <button
              className="btn btn-outline-danger mt-3 mt-md-0"
              onClick={() => {
                setStatusFilter("All");
                setCustomerSearch("");
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center mt-4">
          <p className="text-secondary fs-6">
            No orders match your filters. Try adjusting the search or filter.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredOrders.map((order) => (
            <div key={order._id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{order.customer?.name}</h5>
                  {order.customer?.email && <p>📧 {order.customer.email}</p>}
                  {order.customer?.phone && <p>📞 {order.customer.phone}</p>}
                  <p className="fw-bold">
                    Grand Total: ${order.grandTotal?.toFixed(2)}
                  </p>
                  <p>
                    <span
                      className={`badge ${
                        order.status === "Active"
                          ? "bg-primary"
                          : order.status === "Cancelled"
                          ? "bg-danger"
                          : "bg-success"
                      }`}
                    >
                      {order.status}
                    </span>
                    {" | "}Payment: {order.paymentStatus}
                  </p>

                  <button
                    className="btn btn-sm btn-outline-primary mb-2"
                    onClick={() => setSelectedOrder(order)}
                    data-bs-toggle="modal"
                    data-bs-target="#itemsModal"
                  >
                    View Items
                  </button>

                  {order.status === "Active" ? (
                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-danger flex-grow-1"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-success flex-grow-1"
                        onClick={() => handleCompleteOrder(order._id)}
                      >
                        Complete
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-outline-danger flex-grow-1"
                        onClick={() => handleDeleteOrder(order._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className="modal fade"
        id="itemsModal"
        tabIndex="-1"
        aria-labelledby="itemsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="itemsModalLabel">
                Order Items
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setSelectedOrder(null)}
              ></button>
            </div>
            <div className="modal-body">
              {selectedOrder ? (
                <div>
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="d-flex justify-content-between border-bottom py-2"
                    >
                      <span>{item.product?.name || "Unknown"}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>Price: ${item.price.toFixed(2)}</span>
                      <span>Discount: {item.discount || 0}%</span>
                      <span>
                        Total: $
                        {(
                          (item.price -
                            (item.price * (item.discount || 0)) / 100) *
                          item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No items found.</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrders;
