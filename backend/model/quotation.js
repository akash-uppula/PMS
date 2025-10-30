import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
  {
    organizationAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        finalPrice: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },

    taxRate: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    otherCharges: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ["Draft", "Finalized", "ConvertedToOrder"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

const Quotation = mongoose.model("Quotation", quotationSchema);

export default Quotation;
