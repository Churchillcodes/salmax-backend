const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
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

    source: {
      type: String,
      required: true,
      trim: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Converted"],
      default: "New",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Lead", leadSchema);
