import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const FinalizeQuotation = () => {
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [taxRate, setTaxRate] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await api.get("/employee/quotations");
        setQuotations(res.data.data.filter((q) => q.status === "Draft"));
      } catch (err) {
        console.error(err);
        setNotification({
          type: "error",
          message: "❌ Failed to load quotations.",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    };
    fetchQuotations();
  }, []);

  const handleFinalize = async () => {
    if (!selectedQuotation) return;

    try {
      const payload = { taxRate, shippingFee, otherCharges };
      await api.post(
        `/employee/quotations/finalize/${selectedQuotation._id}`,
        payload
      );

      setNotification({ type: "success", message: "✅ Quotation finalized!" });
      setTimeout(() => setNotification(null), 3000);

      // Remove finalized quotation from list
      setQuotations(quotations.filter((q) => q._id !== selectedQuotation._id));
      setSelectedQuotation(null);
      setTaxRate(0);
      setShippingFee(0);
      setOtherCharges(0);
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "❌ Error finalizing quotation",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Calculate dynamic Grand Total
  const calculateGrandTotal = () => {
    if (!selectedQuotation) return 0;
    const subTotal = (selectedQuotation.items || []).reduce(
      (sum, item) =>
        sum +
        (item.price - (item.price * (item.discount || 0)) / 100) *
          item.quantity,
      0
    );
    const taxAmount = (subTotal * taxRate) / 100;
    const grandTotal = subTotal + taxAmount + shippingFee + otherCharges;
    return grandTotal.toFixed(2);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Finalize Quotation</h2>

      {notification && (
        <div
          className={`alert ${
            notification.type === "success" ? "alert-success" : "alert-danger"
          } text-center`}
        >
          {notification.message}
        </div>
      )}

      <div className="mb-4">
        <label className="form-label">Select Draft Quotation:</label>
        <select
          className="form-select"
          value={selectedQuotation?._id || ""}
          onChange={(e) => {
            const q = quotations.find((q) => q._id === e.target.value);
            setSelectedQuotation(q || null);
            setTaxRate(0);
            setShippingFee(0);
            setOtherCharges(0);
          }}
        >
          <option value="">-- Select Quotation --</option>
          {quotations.map((q) => (
            <option key={q._id} value={q._id}>
              {q.customer.name} - Total: ${q.totalAmount.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {selectedQuotation && (
        <div className="card p-3 mb-4">
          <h5>Quotation Items</h5>

          {/* Headings */}
          <div className="row fw-bold text-center mb-2 border-bottom pb-1">
            <div className="col-md-4">Product</div>
            <div className="col-md-2">Quantity</div>
            <div className="col-md-2">Price</div>
            <div className="col-md-2">Discount (%)</div>
            <div className="col-md-2">Total</div>
          </div>

          {/* Item Rows */}
          {(selectedQuotation.items || []).map((item, idx) => {
            const name = item.product.name || "Unknown";
            const price = item.price || 0;
            const total = (
              (price - (price * (item.discount || 0)) / 100) *
              item.quantity
            ).toFixed(2);

            return (
              <div
                key={idx}
                className="row text-center mb-1 align-items-center"
              >
                <div className="col-md-4">{name}</div>
                <div className="col-md-2">{item.quantity}</div>
                <div className="col-md-2">${price.toFixed(2)}</div>
                <div className="col-md-2">{item.discount || 0}%</div>
                <div className="col-md-2">${total}</div>
              </div>
            );
          })}

          <h5 className="mt-3">Charges</h5>
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                className="form-control"
                placeholder="Enter tax rate"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Shipping Fee</label>
              <input
                type="number"
                min={0}
                className="form-control"
                placeholder="Enter shipping fee"
                value={shippingFee}
                onChange={(e) => setShippingFee(Number(e.target.value))}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Other Charges</label>
              <input
                type="number"
                min={0}
                className="form-control"
                placeholder="Enter other charges"
                value={otherCharges}
                onChange={(e) => setOtherCharges(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Dynamic Grand Total */}
          <div className="text-end fw-bold fs-5 mb-3">
            Grand Total: ${calculateGrandTotal()}
          </div>

          <div className="text-center">
            <button
              className="btn btn-success px-4 py-2"
              onClick={handleFinalize}
            >
              Finalize Quotation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalizeQuotation;
