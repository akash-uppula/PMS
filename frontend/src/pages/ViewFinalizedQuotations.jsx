// src/pages/ViewFinalizedQuotations.jsx
import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const ViewFinalizedQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([
    "Cash on Delivery",
    "Credit Card",
    "Debit Card",
    "UPI",
    "Net Banking",
    "Wallet",
    "Other",
  ]);
  const [selectedPayments, setSelectedPayments] = useState({});

  useEffect(() => {
    fetchFinalizedQuotations();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchFinalizedQuotations = async () => {
    try {
      const res = await api.get("/employee/quotations");
      const finalized = res.data.data.filter((q) => q.status === "Finalized");
      setQuotations(finalized);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch finalized quotations.");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToOrder = async (quotationId) => {
    try {
      const paymentMethod = selectedPayments[quotationId] || "Cash on Delivery";
      await api.post(`/employee/quotations/convert-to-order/${quotationId}`, {
        paymentMethod,
      });
      setMessage("✅ Quotation converted to order successfully!");
      fetchFinalizedQuotations();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "❌ Failed to convert to order."
      );
    }
  };

  if (loading) return <p className="text-center mt-4">Loading quotations...</p>;
  if (quotations.length === 0)
    return (
      <div className="container py-4 d-flex flex-column align-items-center">
        <h2 className="mb-4 text-center">Finalized Quotations</h2>
        <div className="text-center" style={{ maxWidth: "600px" }}>
          <p className="text-secondary fs-6">
            You don’t have any finalized quotations yet.
            <br />
            Once a quotation is finalized, it will appear here so you can track
            and manage it easily.
          </p>
        </div>
      </div>
    );

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Finalized Quotations</h2>
      {message && <div className="alert alert-info text-center">{message}</div>}

      <div className="row g-3">
        {quotations.map((q) => (
          <div key={q._id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{q.customer?.name}</h5>
                {q.customer?.email && <p>📧 {q.customer.email}</p>}
                {q.customer?.phone && <p>📞 {q.customer.phone}</p>}
                <p className="fw-bold">
                  Grand Total: ${q.grandTotal?.toFixed(2)}
                </p>
                <p>
                  <span className="badge bg-primary">{q.status}</span>
                </p>

                {/* Payment Method Selector */}
                <div className="mb-2">
                  <label className="form-label">Payment Method:</label>
                  <select
                    className="form-select"
                    value={selectedPayments[q._id] || ""}
                    onChange={(e) =>
                      setSelectedPayments({
                        ...selectedPayments,
                        [q._id]: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Select Payment Method --</option>
                    {paymentMethods.map((method, idx) => (
                      <option key={idx} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-success flex-grow-1"
                    onClick={() => handleConvertToOrder(q._id)}
                    disabled={!selectedPayments[q._id]} // prevent conversion without selection
                  >
                    Convert to Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewFinalizedQuotations;
