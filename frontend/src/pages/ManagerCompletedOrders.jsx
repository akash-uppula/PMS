import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const ManagerCompletedOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/manager/completed-orders");
        setOrders(res.data.orders);
      } catch (err) {
        console.error("Error fetching completed orders:", err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Completed Orders</h2>

      {orders.length === 0 ? (
        <div
          className="text-center"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <p className="text-secondary fs-6">
            You don’t have any completed orders yet.
            <br />
            Once employees complete orders, they will appear here for easy
            tracking and management.
          </p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="card shadow mb-4">
            <div className="card-body">
              <h5 className="card-title">
                Customer: {order.customer.name} ({order.customer.email})
              </h5>
              <p>
                Created By:{" "}
                <strong>
                  {order.createdBy.firstName} {order.createdBy.lastName}
                </strong>
              </p>
              <p>
                Payment: <strong>{order.paymentStatus}</strong> via{" "}
                {order.paymentMethod}
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
                  {order.items.map((item, idx) => (
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
                  <strong>Subtotal:</strong> ${order.subTotal.toFixed(2)}
                </p>
                <p>
                  <strong>Tax Rate:</strong> {order.taxRate}%
                </p>
                <p>
                  <strong>Tax Amount:</strong> ${order.taxAmount.toFixed(2)}
                </p>
                <p>
                  <strong>Shipping Fee:</strong> ${order.shippingFee}
                </p>
                <p>
                  <strong>Other Charges:</strong> ${order.otherCharges.toFixed(2)}
                </p>
                <h5 className="text-primary">
                  Grand Total: ${order.grandTotal}
                </h5>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ManagerCompletedOrders;
