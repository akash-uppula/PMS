import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const CreateQuotation = () => {
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ product: "", quantity: 1, discount: 0 }]);
  const [notification, setNotification] = useState(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/employee/products");
        setProducts(res.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setNotification({ type: "error", message: "❌ Failed to load products." });
        setTimeout(() => setNotification(null), 3000);
      }
    };
    fetchProducts();
  }, []);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] =
      field === "quantity" || field === "discount" ? Number(value) : value;
    setItems(updated);
  };

  const addItem = () => setItems([...items, { product: "", quantity: 1, discount: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  // Calculate live total
  const calculateTotal = () =>
    items
      .reduce((sum, item) => {
        const product = products.find((p) => p._id === item.product);
        if (!product) return sum;
        const discount = Math.min(item.discount || 0, product.maxDiscount || 100);
        return sum + (product.price - (product.price * discount) / 100) * item.quantity;
      }, 0)
      .toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { customer, items };
      await api.post("/employee/quotations", payload);

      setNotification({ type: "success", message: "✅ Quotation created successfully!" });
      setTimeout(() => setNotification(null), 3000);

      setCustomer({ name: "", email: "", phone: "" });
      setItems([{ product: "", quantity: 1, discount: 0 }]);
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "❌ Error creating quotation",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getAvailableProducts = (currentProductId) =>
    products.filter(
      (p) => !items.some((i) => i.product === p._id && i.product !== currentProductId)
    );

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Create Quotation</h2>

      {notification && (
        <div
          className={`alert ${notification.type === "success" ? "alert-success" : "alert-danger"} text-center`}
        >
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Customer Section */}
        <div className="card mb-4 p-3">
          <h5 className="mb-3">Customer Details</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Customer Name"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="email"
                className="form-control"
                placeholder="Customer Email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <input
                type="tel"
                className="form-control"
                placeholder="Customer Phone"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Quotation Items */}
        <div className="card mb-4 p-3">
          <h5 className="mb-3">Quotation Items</h5>
          <div className="row fw-bold g-3 mb-2">
            <div className="col-md-5">Product</div>
            <div className="col-md-2">Quantity</div>
            <div className="col-md-2">Discount (%)</div>
            <div className="col-md-3">Actions</div>
          </div>
          {items.map((item, index) => {
            const product = products.find((p) => p._id === item.product);
            const maxDiscount = product?.maxDiscount || 100;

            return (
              <div key={index} className="row g-3 align-items-center mb-2">
                <div className="col-md-5">
                  <select
                    className="form-select"
                    value={item.product}
                    onChange={(e) => handleItemChange(index, "product", e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select Product
                    </option>
                    {getAvailableProducts(item.product).map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} - ${p.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-2 d-flex flex-column">
                  <input
                    type="number"
                    min="0"
                    max={maxDiscount}
                    className="form-control"
                    value={item.discount}
                    onChange={(e) => {
                      let value = Number(e.target.value);
                      if (value > maxDiscount) value = maxDiscount;
                      handleItemChange(index, "discount", value);
                    }}
                  />
                </div>

                <div className="col-md-3 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-danger flex-grow-1"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    Remove
                  </button>
                  {index === items.length - 1 && (
                    <button type="button" className="btn btn-primary flex-grow-1" onClick={addItem}>
                      Add Item
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="text-end fw-bold fs-5 mt-3">Total: ${calculateTotal()}</div>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-success px-4 py-2">
            Create Quotation
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuotation;
