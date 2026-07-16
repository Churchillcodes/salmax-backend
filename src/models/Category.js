const mongoose = require("mongoose");

// Categories are admin-managed (not a hardcoded enum) so new subcategories
// can be added from the dashboard as the boutique's catalogue grows.
//
// How the fields map to the actual business structure:
//   productType: the top-level product line -> "Shoes" | "Bags" | "Clothes"
//   group: the audience split within that product line, e.g.
//     Shoes   -> "Men" | "Ladies" | "Kids"
//     Clothes -> "Men" | "Women" | "Boys" | "Girls"
//     Bags    -> null (Bags aren't split by audience; "Handbags" and
//                "School Bags" are themselves the category names)
//   name: the actual category label shown to customers, e.g.
//     "Sneakers", "Heels", "Loafers", "Handbags", "School Bags", "Dresses"
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },

    productType: {
      type: String,
      required: [true, "Product type is required"],
      enum: ["Shoes", "Bags", "Clothes"],
    },

    group: {
      type: String,
      trim: true,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevents duplicate categories within the same productType + group combo
// (e.g. two "Sneakers" categories under Shoes/Men), while still allowing the
// same name to exist across different combos (e.g. "Sneakers" under both
// Shoes/Men and Shoes/Ladies).
categorySchema.index({ name: 1, productType: 1, group: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
