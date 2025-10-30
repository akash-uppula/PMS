// src/pages/ViewOrders.jsx
import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // For modal

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
  if (orders.length === 0)
    return (
      <div className="container py-4 d-flex flex-column align-items-center">
        <h2 className="mb-4 text-center">Orders</h2>
        <div className="text-center" style={{ maxWidth: "600px" }}>
          <p className="text-secondary fs-6">
            You don’t have any orders yet.
            <br />
            Once orders are created, they will appear here for easy tracking and
            management.
          </p>
        </div>
      </div>
    );

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">My Orders</h2>
      {message && <div className="alert alert-info text-center">{message}</div>}

      <div className="row g-3">
        {orders.map((order) => (
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

                {/* Modal trigger */}
                <button
                  className="btn btn-sm btn-outline-primary mb-2"
                  onClick={() => setSelectedOrder(order)}
                  data-bs-toggle="modal"
                  data-bs-target="#itemsModal"
                >
                  View Items
                </button>

                {/* Actions */}
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

      {/* Modal for viewing items */}
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
