import Order from "../model/order.js";
import Product from "../model/product.js";

// -------------------- GET ALL ORDERS --------------------
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ createdBy: req.user._id })
      .populate("items.product", "name price")
      .populate("quotationId", "status")
      .populate("createdBy", "firstName lastName email")
      .sort({
        "customer.name": 1,
        createdAt: -1,
      });

    res.status(200).json({ status: "success", data: orders });
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// -------------------- GET ORDER BY ID --------------------
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params._id,
      createdBy: req.user._id,
    })
      .populate("items.product", "name price")
      .populate("quotationId", "status");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    console.error("❌ Error fetching order:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// -------------------- CANCEL ORDER --------------------
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params._id,
      createdBy: req.user._id,
      status: "Active",
    }).populate("items.product");

    if (!order)
      return res.status(404).json({ message: "Active order not found" });

    // Restore stock
    for (let item of order.items) {
      item.product.stock += item.quantity;
      await item.product.save();
    }

    order.status = "Cancelled";
    await order.save();

    res
      .status(200)
      .json({
        status: "success",
        message: "Order cancelled successfully",
        data: order,
      });
  } catch (err) {
    console.error("❌ Error cancelling order:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// -------------------- COMPLETE ORDER --------------------
export const completeOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params._id,
      createdBy: req.user._id,
      status: "Active",
    });

    if (!order)
      return res.status(404).json({ message: "Active order not found" });

    order.status = "Completed";
    order.paymentStatus = "Paid";
    await order.save();

    res
      .status(200)
      .json({
        status: "success",
        message: "Order completed successfully",
        data: order,
      });
  } catch (err) {
    console.error("❌ Error completing order:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// -------------------- DELETE ORDER --------------------
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params._id,
      createdBy: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Order deleted successfully",
      data: order,
    });
  } catch (err) {
    console.error("❌ Error deleting order:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};
