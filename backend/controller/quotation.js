import Quotation from "../model/quotation.js";
import Product from "../model/product.js";
import User from "../model/user.js";
import Order from "../model/order.js";

// -------------------- CREATE QUOTATION (Draft) --------------------
export const createQuotation = async (req, res) => {
  try {
    const { customer, items } = req.body;
    if (!items || items.length === 0)
      return res
        .status(400)
        .json({ message: "Quotation must have at least one item" });

    const employee = await User.findById(req.user._id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    const organizationAdminId = employee.organizationAdminId;
    const managerId = employee.managerId || null;
    if (!organizationAdminId)
      return res
        .status(400)
        .json({ message: "Employee does not have an org admin assigned" });

    let totalAmount = 0;

    const processedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product)
          throw new Error(`Product with ID ${item.product} not found`);

        const discount = Math.min(item.discount || 0, product.maxDiscount);
        const finalPrice =
          (product.price - (product.price * discount) / 100) * item.quantity;

        totalAmount += finalPrice;

        return {
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          discount,
          finalPrice: parseFloat(finalPrice.toFixed(2)),
        };
      })
    );

    const quotation = new Quotation({
      organizationAdminId,
      managerId,
      createdBy: req.user._id,
      customer,
      items: processedItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    });

    await quotation.save();
    await quotation.populate("items.product", "name price maxDiscount");

    res.status(201).json({
      status: "success",
      message: "Quotation created successfully",
      data: quotation,
    });
  } catch (err) {
    console.error("❌ Error creating quotation:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// -------------------- GET ALL QUOTATIONS --------------------
export const getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ createdBy: req.user._id })
      .populate("items.product", "name price maxDiscount")
      .sort({"customer.name": 1, createdAt: -1 });
    res.status(200).json({ status: "success", data: quotations });
  } catch (err) {
    console.error("❌ Error fetching quotations:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// -------------------- GET QUOTATION BY ID --------------------
export const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      _id: req.params._id,
      createdBy: req.user._id,
    }).populate("items.product", "name price maxDiscount");
    if (!quotation)
      return res.status(404).json({ message: "Quotation not found" });

    res.status(200).json({ status: "success", data: quotation });
  } catch (err) {
    console.error("❌ Error fetching quotation:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// -------------------- UPDATE QUOTATION (Draft Only) --------------------
export const updateQuotation = async (req, res) => {
  try {
    const {
      customer,
      itemsToAdd = [],
      itemsToUpdate = [],
      itemsToDelete = [],
    } = req.body;

    const quotation = await Quotation.findOne({
      _id: req.params._id,
      createdBy: req.user._id,
      status: "Draft",
    });
    if (!quotation)
      return res.status(404).json({ message: "Draft quotation not found" });

    // Remove deleted items
    if (itemsToDelete.length > 0) {
      quotation.items = quotation.items.filter(
        (item) => !itemsToDelete.includes(item._id.toString())
      );
    }

    let totalAmount = 0;

    // Update existing items
    for (let upd of itemsToUpdate) {
      const product = await Product.findById(upd.product);
      if (!product) throw new Error(`Product with ID ${upd.product} not found`);

      const discount = Math.min(upd.discount || 0, product.maxDiscount);
      const finalPrice =
        (product.price - (product.price * discount) / 100) * upd.quantity;

      const existingItem = quotation.items.id(upd._id);
      if (existingItem) {
        existingItem.product = product._id;
        existingItem.quantity = upd.quantity;
        existingItem.discount = discount;
        existingItem.price = product.price;
        existingItem.finalPrice = parseFloat(finalPrice.toFixed(2));
      }

      totalAmount += finalPrice;
    }

    // Add new items
    for (let newItem of itemsToAdd) {
      const product = await Product.findById(newItem.product);
      if (!product)
        throw new Error(`Product with ID ${newItem.product} not found`);

      const discount = Math.min(newItem.discount || 0, product.maxDiscount);
      const finalPrice =
        (product.price - (product.price * discount) / 100) * newItem.quantity;

      quotation.items.push({
        product: product._id,
        quantity: newItem.quantity,
        discount,
        price: product.price,
        finalPrice: parseFloat(finalPrice.toFixed(2)),
      });

      totalAmount += finalPrice;
    }

    quotation.customer = customer;
    quotation.totalAmount = parseFloat(totalAmount.toFixed(2));

    await quotation.save();
    await quotation.populate("items.product", "name price maxDiscount");

    res
      .status(200)
      .json({
        status: "success",
        message: "Quotation updated successfully",
        data: quotation,
      });
  } catch (err) {
    console.error("❌ Error updating quotation:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// -------------------- DELETE QUOTATION (Draft Only) --------------------
export const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOneAndDelete({
      _id: req.params._id,
      createdBy: req.user._id,
      status: "Draft",
    });
    if (!quotation)
      return res.status(404).json({ message: "Draft quotation not found" });

    res
      .status(200)
      .json({ status: "success", message: "Quotation deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting quotation:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// -------------------- FINALIZE QUOTATION --------------------
export const finalizeQuotation = async (req, res) => {
  try {
    const { taxRate = 0, shippingFee = 0, otherCharges = 0 } = req.body;

    const quotation = await Quotation.findOne({
      _id: req.params._id,
      createdBy: req.user._id,
      status: "Draft",
    }).populate("items.product", "name price maxDiscount");

    if (!quotation)
      return res.status(404).json({ message: "Draft quotation not found" });

    const subTotal = quotation.items.reduce(
      (sum, item) => sum + item.finalPrice,
      0
    );
    const taxAmount = (subTotal * taxRate) / 100;

    const grandTotal = parseFloat(
      (subTotal + taxAmount + shippingFee + otherCharges).toFixed(2)
    );

    quotation.taxRate = taxRate;
    quotation.taxAmount = parseFloat(taxAmount.toFixed(2));
    quotation.shippingFee = shippingFee;
    quotation.otherCharges = otherCharges;
    quotation.subTotal = parseFloat(subTotal.toFixed(2));
    quotation.grandTotal = grandTotal;
    quotation.status = "Finalized";

    await quotation.save();

    res
      .status(200)
      .json({
        status: "success",
        message: "Quotation finalized successfully",
        data: quotation,
      });
  } catch (err) {
    console.error("❌ Error finalizing quotation:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// -------------------- CONVERT QUOTATION TO ORDER (Development) --------------------
export const convertQuotationToOrder = async (req, res) => {
  try {
    // Find finalized quotation
    const quotation = await Quotation.findOne({
      _id: req.params._id,
      createdBy: req.user._id,
      status: "Finalized",
    }).populate("items.product", "name price maxDiscount stock");

    if (!quotation) {
      return res.status(404).json({ message: "Finalized quotation not found" });
    }

    // Check stock
    for (let item of quotation.items) {
      if (item.product.stock < item.quantity) {
        return res
          .status(400)
          .json({
            message: `Not enough stock for product ${item.product.name}`,
          });
      }
    }

    // Reduce stock
    for (let item of quotation.items) {
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    const subTotal = quotation.items.reduce(
      (sum, item) => sum + item.finalPrice,
      0
    );
    const grandTotal = parseFloat(
      (
        subTotal +
        quotation.taxAmount +
        quotation.shippingFee +
        quotation.otherCharges
      ).toFixed(2)
    );

    const paymentMethod = req.body?.paymentMethod || "Cash on Delivery";
    const paymentStatus =
      paymentMethod === "Cash on Delivery" ? "Pending" : "Paid";

    const order = new Order({
      quotationId: quotation._id,
      organizationAdminId: quotation.organizationAdminId,
      managerId: quotation.managerId,
      createdBy: quotation.createdBy,
      customer: quotation.customer,
      items: quotation.items,
      subTotal: parseFloat(subTotal.toFixed(2)),
      taxRate: quotation.taxRate,
      taxAmount: parseFloat(quotation.taxAmount.toFixed(2)),
      shippingFee: quotation.shippingFee,
      otherCharges: quotation.otherCharges,
      grandTotal,
      status: "Active",
      paymentStatus,
      paymentMethod,
    });

    await order.save();

    quotation.status = "ConvertedToOrder";
    await quotation.save();

    res.status(201).json({
      status: "success",
      message: "Quotation converted to order successfully",
      data: order,
    });
  } catch (err) {
    console.error("❌ Error converting quotation:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};
