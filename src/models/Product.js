const mongoose = require("mongoose");

// One entry per size the product is stocked in, each with its own quantity.
// Works for both numeric shoe sizes ("42") and letter clothing sizes ("M")
// since size is stored as a string either way.
const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: [true, "Size label is required"],
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    listedPrice: {
      type: Number,
      required: [true, "Listed price is required"],
      min: 1,
    },

    negotiable: {
      type: Boolean,
      default: true,
    },

    // Replaces Gleamy's flat `quantity` field. Salmax is inventory-only (no
    // made-to-order), but every product needs at least one size entry so
    // stock can be tracked and reserved per size.
    sizes: {
      type: [sizeSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one size with a quantity is required",
      },
    },

    colors: [
      {
        type: String,
        trim: true,
      },
    ],

    images: [
      {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          required: true,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Convenience total across all sizes, e.g. for quick display on product cards
productSchema.virtual("totalQuantity").get(function () {
  if (!Array.isArray(this.sizes)) return 0;

  return this.sizes.reduce((sum, s) => sum + (s?.quantity || 0), 0);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
