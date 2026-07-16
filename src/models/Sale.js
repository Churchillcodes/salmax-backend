const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Snapshot fields - preserved even if the product is later edited/archived
    productName: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    customerPhone: {
      type: String,
      required: true,
      match: [
        /^(?:\+254|254|0)(7\d{8}|1\d{8})$/,
        "Please provide a valid Kenyan phone number",
      ],
    },

    customerLocation: {
      type: String,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
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

    totalAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Sale", saleSchema);
