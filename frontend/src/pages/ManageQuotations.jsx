import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ManageQuotations = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [draftQuotations, setDraftQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [taxRate, setTaxRate] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);

  const [finalizedQuotations, setFinalizedQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethods] = useState([
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
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const res = await api.get("/employee/quotations");
      const data = res.data.data;
      setDraftQuotations(data.filter((q) => q.status === "Draft"));
      setFinalizedQuotations(data.filter((q) => q.status === "Finalized"));
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load quotations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (msg) => {
    setMessage(msg);
  };

  const validateStock = () => {
    if (!selectedQuotation) return true;
    for (const item of selectedQuotation.items) {
      const stock = item.product?.stock ?? 0;
      if (item.quantity > stock) {
        showMessage(
          `⚠️ Cannot finalize: "${item.product.name}" has only ${stock} in stock.`
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

      showMessage("✅ Quotation finalized successfully!");
      setSelectedQuotation(null);
      setTaxRate(0);
      setShippingFee(0);
      setOtherCharges(0);
      fetchQuotations();
    } catch (err) {
      console.error("Error finalizing quotation:", err);
      showMessage("❌ Error finalizing quotation.");
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

  const generatePDF = (quotation, paymentMethod) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = "Order Receipt";
    doc.setFontSize(16);
    const x = (pageWidth - doc.getTextWidth(title)) / 2;
    doc.text(title, x, 20);
    doc.setFontSize(11);
    doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, 14, 30);

    const leftX = 14;
    const rightX = pageWidth / 2 + 50;
    let currentY = 40;

    doc.setFontSize(13);
    doc.text("Customer Details:", leftX, currentY);
    doc.text("Company Details:", rightX, currentY);
    currentY += 7;

    doc.setFontSize(11);
    doc.text(`Name: ${quotation.customer?.name || "N/A"}`, leftX, currentY);
    doc.text("Company: PMS", rightX, currentY);
    currentY += 7;
    doc.text(`Email: ${quotation.customer?.email || "N/A"}`, leftX, currentY);
    doc.text("Email: pms@email.com", rightX, currentY);
    currentY += 7;
    doc.text(`Phone: ${quotation.customer?.phone || "N/A"}`, leftX, currentY);
    doc.text("Phone: +91-7013447197", rightX, currentY);
    currentY += 10;
    doc.text(`Payment Method: ${paymentMethod || "N/A"}`, leftX, currentY);
    currentY += 15;

    const tableBody = (quotation.items || []).map((item, index) => {
      const name = item.product?.name || "Unknown";
      const price = item.price || 0;
      const discount = item.discount || 0;
      const total = ((price - (price * discount) / 100) * item.quantity).toFixed(2);
      return [
        index + 1,
        name,
        `$${price.toFixed(2)}`,
        `${item.quantity}`,
        `${discount}%`,
        `$${total}`,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["#", "Product", "Price", "Qty", "Discount", "Total"]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { halign: "center" },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Tax Rate: ${quotation.taxRate || 0}%`, 14, finalY);
    doc.text(`Shipping Fee: $${quotation.shippingFee || 0}`, 14, finalY + 8);
    doc.text(`Other Charges: $${quotation.otherCharges || 0}`, 14, finalY + 16);
    doc.text(`Grand Total: $${quotation.grandTotal?.toFixed(2) || 0}`, 14, finalY + 26);
    doc.text("Thank you for your business!", 14, finalY + 40);
    doc.save(
      `Order_Receipt_${quotation.customer?.name || "Customer"}_${Date.now()}.pdf`
    );
  };

  const handleConvertToOrder = async (quotationId) => {
    try {
      const paymentMethod = selectedPayments[quotationId];
      if (!paymentMethod) return showMessage("⚠️ Please select a payment method first.");

      await api.post(`/employee/quotations/convert-to-order/${quotationId}`, {
        paymentMethod,
      });

      const quotation = finalizedQuotations.find((q) => q._id === quotationId);
      generatePDF(quotation, paymentMethod);
      showMessage("✅ Quotation converted to order and PDF generated!");
      fetchQuotations();
    } catch (err) {
      console.error(err);
      showMessage("❌ Failed to convert to order.");
    }
  };

  const filteredFinalized = finalizedQuotations.filter((q) =>
    q.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="text-center mt-4">Loading...</p>;

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4 fw-bold">Manage Quotations</h2>

      {message && <div className="alert alert-info text-center">{message}</div>}

      <section className="mb-5">
        <h4 className="mb-3 text-dark">Finalize Draft Quotation</h4>
        <div className="mb-4">
          <label className="form-label fw-semibold">Select Draft Quotation:</label>
          <select
            className="form-select"
            value={selectedQuotation?._id || ""}
            onChange={(e) => {
              const q = draftQuotations.find((q) => q._id === e.target.value);
              setSelectedQuotation(q || null);
              setTaxRate(0);
              setShippingFee(0);
              setOtherCharges(0);
            }}
          >
            <option value="">-- Select Quotation --</option>
            {draftQuotations.map((q) => (
              <option key={q._id} value={q._id}>
                {q.customer.name} — Total: ${q.totalAmount.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {selectedQuotation && (
          <div className="card shadow-sm p-3 border-0">
            <h5 className="fw-semibold mb-3">Quotation Items</h5>
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
      </section>

      <hr className="my-5" />

      <section>
        <h4 className="mb-3 text-dark">View Finalized Quotations</h4>
        <div className="mb-4 d-flex justify-content-start">
          <input
            type="text"
            className="form-control w-50"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredFinalized.length === 0 ? (
          <p className="text-center text-secondary">
            No finalized quotations found for "{searchTerm}".
          </p>
        ) : (
          <div className="row g-3">
            {filteredFinalized.map((q) => (
              <div key={q._id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{q.customer?.name}</h5>
                    {q.customer?.email && <p>📧 {q.customer.email}</p>}
                    {q.customer?.phone && <p>📞 {q.customer.phone}</p>}
                    <p className="mb-1"><strong>Tax Rate:</strong> {q.taxRate || 0}%</p>
                    <p className="mb-1"><strong>Shipping Fee:</strong> ${q.shippingFee || 0}</p>
                    <p className="mb-1"><strong>Other Charges:</strong> ${q.otherCharges || 0}</p>
                    <p className="fw-bold fs-6">
                      Grand Total: ${q.grandTotal?.toFixed(2) || 0}
                    </p>
                    <p><span className="badge bg-success">{q.status}</span></p>

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
                        disabled={!selectedPayments[q._id]}
                      >
                        Place Order & Generate PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ManageQuotations;
