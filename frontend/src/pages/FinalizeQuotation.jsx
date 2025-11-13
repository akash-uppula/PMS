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
        console.error("Error fetching quotations:", err);
        showNotification("❌ Failed to load quotations.", "error");
      }
    };
    fetchQuotations();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateStock = () => {
    if (!selectedQuotation) return true;
    for (const item of selectedQuotation.items) {
      const stock = item.product?.stock ?? 0;
      if (item.quantity > stock) {
        showNotification(
          `⚠️ Cannot finalize: "${item.product.name}" has only ${stock} in stock.`,
          "error"
        );
        return false;
      }
    }
    return true;
  };

  const handleFinalize = async () => {
    if (!selectedQuotation) return;
    if (!validateStock()) return;

    try {
      const payload = { taxRate, shippingFee, otherCharges };
      await api.post(`/employee/quotations/finalize/${selectedQuotation._id}`, payload);

      showNotification("✅ Quotation finalized successfully!", "success");

      setQuotations((prev) => prev.filter((q) => q._id !== selectedQuotation._id));
      setSelectedQuotation(null);
      setTaxRate(0);
      setShippingFee(0);
      setOtherCharges(0);
    } catch (err) {
      console.error("Error finalizing quotation:", err);
      showNotification(
        err.response?.data?.message || "❌ Error finalizing quotation.",
        "error"
      );
    }
  };

  const calculateGrandTotal = () => {
    if (!selectedQuotation) return "0.00";
    const subTotal = selectedQuotation.items.reduce((sum, item) => {
      const price = item.price || 0;
      const discount = item.discount || 0;
      return sum + (price - (price * discount) / 100) * item.quantity;
    }, 0);
    const taxAmount = (subTotal * taxRate) / 100;
    const grandTotal = subTotal + taxAmount + shippingFee + otherCharges;
    return grandTotal.toFixed(2);
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4 fw-bold">Finalize Quotation</h2>

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
        <label className="form-label fw-semibold">Select Draft Quotation:</label>
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
              {q.customer.name} — Total: ${q.totalAmount.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {selectedQuotation && (
        <div className="card shadow-sm p-3 mb-4 border-0">
          <h5 className="mb-3 fw-semibold">Quotation Items</h5>

          <div className="row fw-bold text-center border-bottom pb-2 mb-2">
            <div className="col-md-4">Product</div>
            <div className="col-md-2">Qty / Stock</div>
            <div className="col-md-2">Price</div>
            <div className="col-md-2">Discount (%)</div>
            <div className="col-md-2">Total</div>
          </div>

          {selectedQuotation.items.map((item, idx) => {
            const name = item.product?.name || "Unknown";
            const price = item.price || 0;
            const stock = item.product?.stock || 0;
            const total = (
              (price - (price * (item.discount || 0)) / 100) * item.quantity
            ).toFixed(2);

            return (
              <div
                key={idx}
                className={`row text-center align-items-center mb-2 ${
                  item.quantity > stock ? "bg-light text-danger fw-semibold" : ""
                }`}
              >
                <div className="col-md-4">{name}</div>
                <div className="col-md-2">
                  {item.quantity}/{stock}
                </div>
                <div className="col-md-2">${price.toFixed(2)}</div>
                <div className="col-md-2">{item.discount || 0}%</div>
                <div className="col-md-2">${total}</div>
              </div>
            );
          })}

          <h5 className="mt-4 fw-semibold">Charges</h5>
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                className="form-control"
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
                value={otherCharges}
                onChange={(e) => setOtherCharges(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="text-end fw-bold fs-5 mb-3">
            Grand Total: ${calculateGrandTotal()}
          </div>

          <div className="text-center">
            <button
              className="btn btn-success px-4 py-2"
              onClick={handleFinalize}
              disabled={selectedQuotation.items.some(
                (item) => item.quantity > (item.product?.stock || 0)
              )}
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
