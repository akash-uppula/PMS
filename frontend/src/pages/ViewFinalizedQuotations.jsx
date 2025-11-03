import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ViewFinalizedQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
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
    fetchFinalizedQuotations();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
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

  const generatePDF = (quotation, paymentMethod) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  const pageWidth = doc.internal.pageSize.getWidth();
  const title = "Order Receipt";
  const textWidth = doc.getTextWidth(title);
  const x = (pageWidth - textWidth) / 2;
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

  doc.setFontSize(12);
  doc.text(`Payment Method: ${paymentMethod || "N/A"}`, leftX, currentY);
  currentY += 15;

  const tableBody = (quotation.items || []).map((item, index) => {
    const name = item.product?.name || "Unknown";
    const price = item.price || 0;
    const discount = item.discount || 0;
    const total = (
      (price - (price * discount) / 100) * item.quantity
    ).toFixed(2);
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

  doc.setFontSize(11);
  doc.text(`Tax Rate: ${quotation.taxRate || 0}%`, 14, finalY);
  doc.text(`Shipping Fee: $${quotation.shippingFee || 0}`, 14, finalY + 8);
  doc.text(`Other Charges: $${quotation.otherCharges || 0}`, 14, finalY + 16);

  doc.setFontSize(12);
  doc.text(
    `Grand Total: $${quotation.grandTotal?.toFixed(2) || 0}`,
    14,
    finalY + 26
  );

  doc.setFontSize(11);
  doc.text("Thank you for your business!", 14, finalY + 40);

  doc.save(
    `Order_Receipt_${quotation.customer?.name || "Customer"}_${Date.now()}.pdf`
  );
};


  const handleConvertToOrder = async (quotationId) => {
    try {
      const paymentMethod = selectedPayments[quotationId];
      if (!paymentMethod) {
        setMessage("⚠️ Please select a payment method before converting.");
        return;
      }

      await api.post(`/employee/quotations/convert-to-order/${quotationId}`, {
        paymentMethod,
      });

      const quotation = quotations.find((q) => q._id === quotationId);

      generatePDF(quotation, paymentMethod);

      setMessage("✅ Quotation converted to order and PDF generated!");
      fetchFinalizedQuotations();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Failed to convert to order.");
    }
  };

  if (loading) return <p className="text-center mt-4">Loading quotations...</p>;

  if (quotations.length === 0)
    return (
      <div className="container py-4 d-flex flex-column align-items-center">
        <h2 className="mb-4 text-center">Finalized Quotations</h2>
        <p className="text-secondary text-center" style={{ maxWidth: "600px" }}>
          You don’t have any finalized quotations yet.
          <br />
          Once a quotation is finalized, it will appear here for easy tracking,
          downloading, and order conversion.
        </p>
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

                <p className="mb-1"><strong>Tax Rate:</strong> {q.taxRate || 0}%</p>
                <p className="mb-1"><strong>Shipping Fee:</strong> ${q.shippingFee || 0}</p>
                <p className="mb-1"><strong>Other Charges:</strong> ${q.otherCharges || 0}</p>
                <p className="fw-bold fs-6">
                  Grand Total: ${q.grandTotal?.toFixed(2) || 0}
                </p>

                <p>
                  <span className="badge bg-success">{q.status}</span>
                </p>

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
    </div>
  );
};

export default ViewFinalizedQuotations;
