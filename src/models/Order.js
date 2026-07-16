const mongoose = require("mongoose");

// Salmax is inventory-only (no made-to-order), so unlike Gleamy's Order this
// drops orderType, isMadeToOrder branching, customRequirements, and the
// "In Production" status. It adds `size`, since every order is for one
// specific size variant of a product.
const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^(?:\+254|254|0)(7\d{8}|1\d{8})$/,
        "Please provide a valid Kenyan phone number",
      ],
    },

    customerLocation: {
      type: String,
      trim: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    size: {
      type: String,
      required: [true, "Size is required"],
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    listedPrice: {
      type: Number,
      required: true,
      min: 1,
    },

    agreedPrice: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Ready", "Delivered", "Cancelled"],
      default: "Pending",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
