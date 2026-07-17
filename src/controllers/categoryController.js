const Category = require("../models/Category");
const normalizeText = require("../utils/normalizeText");

const ALLOWED_PRODUCT_TYPES = ["Shoes", "Bags", "Clothes"];

// create category (admin adds a new subcategory, e.g. "Loafers" under Shoes/Men)
const createCategory = async (req, res) => {
  try {
    const { name, productType, group } = req.body;

    if (!name || !productType) {
      return res
        .status(400)
        .json({ message: "Name and productType are required" });
    }

    const normalizedType = normalizeText(productType);
    if (!ALLOWED_PRODUCT_TYPES.includes(normalizedType)) {
      return res.status(400).json({
        message: `productType must be one of: ${ALLOWED_PRODUCT_TYPES.join(", ")}`,
      });
    }

    const normalizedName = normalizeText(name);
    const normalizedGroup = group ? normalizeText(group) : null;

    const duplicate = await Category.findOne({
      name: normalizedName,
      productType: normalizedType,
      group: normalizedGroup,
    });
    if (duplicate) {
      return res.status(409).json({ message: "This category already exists" });
    }

    const category = await Category.create({
      name: normalizedName,
      productType: normalizedType,
      group: normalizedGroup,
    });

    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "This category already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

// get all categories - PUBLIC (storefront needs this to render filters/dropdowns)
const getAllCategories = async (req, res) => {
  try {
    const { productType, group } = req.query;
    const filter = { isActive: true };

    if (productType) filter.productType = normalizeText(productType);
    if (group) filter.group = normalizeText(group);

    const categories = await Category.find(filter).sort({
      productType: 1,
      group: 1,
      name: 1,
    });

    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get all archived categories - ADMIN
const getArchivedCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: false }).sort({
      updatedAt: -1,
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update a category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.name) updates.name = normalizeText(updates.name);
    if (updates.productType) {
      updates.productType = normalizeText(updates.productType);
      if (!ALLOWED_PRODUCT_TYPES.includes(updates.productType)) {
        return res.status(400).json({
          message: `productType must be one of: ${ALLOWED_PRODUCT_TYPES.join(", ")}`,
        });
      }
    }
    if (updates.group) updates.group = normalizeText(updates.group);

    const category = await Category.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: "This category already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

// archive (soft-delete) a category
// Kept soft so existing products/orders/sales referencing it stay intact -
// it just disappears from the admin "add product" dropdown and public filters.
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { returnDocument: "after" },
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .json({ message: "Category archived successfully", category });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getArchivedCategories,
  updateCategory,
  deleteCategory,
};
