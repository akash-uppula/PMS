import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const ManagerFinalizedQuotations = () => {
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get("/manager/finalized-quotations");
      setQuotations(res.data.quotations);
    };
    fetchData();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Finalized Quotations</h2>

      {quotations.length === 0 ? (
        <div
          className="text-center"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <p className="text-secondary fs-6">
            You don’t have any finalized quotations yet.
            <br />
            Once employees create and finalize quotations, they will appear here
            for easy tracking and management.
          </p>
        </div>
      ) : (
        quotations.map((q) => (
          <div key={q._id} className="card shadow mb-4">
            <div className="card-body">
              <h5 className="card-title">
                Customer: {q.customer.name} ({q.customer.email})
              </h5>
              <p>
                Created By:{" "}
                <strong>
                  {q.createdBy.firstName} {q.createdBy.lastName}
                </strong>
              </p>

              {/* Items Table */}
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Discount (%)</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {q.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product?.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price}</td>
                      <td>{item.discount}%</td>
                      <td>${item.finalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-3">
                <p>
                  <strong>Subtotal:</strong> ${q.totalAmount}
                </p>
                <p>
                  <strong>Tax Rate:</strong> {q.taxRate}%
                </p>
                <p>
                  <strong>Tax Amount:</strong> ${q.taxAmount}
                </p>
                <p>
                  <strong>Shipping Fee:</strong> ${q.shippingFee}
                </p>
                <p>
                  <strong>Other Charges:</strong> ${q.otherCharges}
                </p>
                <h5 className="text-primary">Grand Total: ${q.grandTotal.toFixed(2)}</h5>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ManagerFinalizedQuotations;
