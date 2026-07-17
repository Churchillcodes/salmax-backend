const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");
const normalizeText = require("../utils/normalizeText");

// create product
const createProduct = async (req, res) => {
  try {
    const { name, category, sizes } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const existingCategory = await Category.findOne({
      _id: category,
      isActive: true,
    });
    if (!existingCategory) {
      return res.status(400).json({ message: "Invalid or inactive category" });
    }

    if (!Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({
        message: "At least one size with a quantity is required",
      });
    }

    // Case-insensitive duplicate check on name
    const duplicate = await Product.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
    if (duplicate) {
      return res.status(409).json({ message: "Product already exists" });
    }

    const newProduct = await Product.create(req.body);
    res
      .status(201)
      .json({ message: "Product created successfully", newProduct });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    res.status(500).json({ message: err.message });
  }
};

// retrieve all products - PUBLIC, supports filtering by productType/group/category
const getAllProducts = async (req, res) => {
  try {
    const { productType, group, category } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    } else if (productType || group) {
      const categoryFilter = { isActive: true };
      if (productType) categoryFilter.productType = normalizeText(productType);
      if (group) categoryFilter.group = normalizeText(group);

      const matchingCategories =
        await Category.find(categoryFilter).select("_id");
      filter.category = { $in: matchingCategories.map((c) => c._id) };
    }

    const products = await Product.find(filter)
      .populate("category", "name productType group")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// retrieving a single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({
      _id: id,
      isActive: true,
    }).populate("category", "name productType group");

    if (!product) {
      return res.status(404).json({ message: `No product matches ID ${id}.` });
    }
    res.status(200).json(product);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: err.message });
  }
};

// update a product by ID
const updateProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.name) {
      const duplicate = await Product.findOne({
        name: new RegExp(`^${req.body.name}$`, "i"),
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Product name already exists",
        });
      }
    }

    if (req.body.category) {
      const existingCategory = await Category.findOne({
        _id: req.body.category,
        isActive: true,
      });
      if (!existingCategory) {
        return res
          .status(400)
          .json({ message: "Invalid or inactive category" });
      }
    }

    if (req.body.sizes !== undefined) {
      if (!Array.isArray(req.body.sizes) || req.body.sizes.length === 0) {
        return res.status(400).json({
          message: "At least one size with a quantity is required",
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: err.message });
  }
};

// get low-stock products (per-size threshold)
const getLowStockProducts = async (req, res) => {
  try {
    const parsedThreshold = parseInt(req.query.threshold);
    if (req.query.threshold !== undefined) {
      if (isNaN(parsedThreshold) || parsedThreshold < 0) {
        return res.status(400).json({
          message: "Threshold must be a valid positive number",
        });
      }
    }
    const threshold = isNaN(parsedThreshold) ? 5 : parsedThreshold;

    const products = await Product.find({
      isActive: true,
      sizes: { $elemMatch: { quantity: { $lte: threshold } } },
    }).populate("category", "name productType group");

    // Attach which specific sizes are low, since a product can have some
    // sizes well-stocked and others running out at the same time.
    const withLowSizes = products.map((p) => {
      const obj = p.toObject();
      obj.lowStockSizes = obj.sizes.filter((s) => s.quantity <= threshold);
      return obj;
    });

    res.status(200).json(withLowSizes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// restock (increase) a specific size
const increaseStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, quantity } = req.body;
    const addedAmount = Number(quantity);

    if (!size) {
      return res.status(400).json({ message: "Size is required" });
    }
    if (isNaN(addedAmount) || addedAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Restock amount must be greater than 0" });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: id,
        isActive: true,
        "sizes.size": size,
      },
      {
        $inc: { "sizes.$.quantity": addedAmount },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
    if (!product) {
      return res.status(404).json({ message: "Product or size not found" });
    }

    res
      .status(200)
      .json({ message: "Product restocked successfully", product });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: err.message });
  }
};

// reduce stock for a specific size
const reduceStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, quantity } = req.body;
    const requestedAmount = Number(quantity);

    if (!size) {
      return res.status(400).json({ message: "Size is required" });
    }
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Stock amount must be greater than 0" });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: id,
        isActive: true,
        "sizes.size": size,
        "sizes.quantity": { $gte: requestedAmount },
      },
      {
        $inc: { "sizes.$.quantity": -requestedAmount },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
    if (!product) {
      return res
        .status(400)
        .json({ message: "Product/size not found or insufficient stock" });
    }

    res.status(200).json({ message: "Stock reduced successfully", product });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: err.message });
  }
};

// delete (archive) a product
const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      {
        returnDocument: "after",
      },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product archived successfully",
      product,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    res.status(500).json({
      message: err.message,
    });
  }
};

// retrieve all archived products
const getArchivedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: false,
    })
      .populate("category", "name productType group")
      .sort({
        updatedAt: -1,
      });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// restore an archived product
const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: true },
      { returnDocument: "after" },
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product restored successfully",
      product,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    res.status(500).json({
      message: err.message,
    });
  }
};

// uploading product images
const uploadProductImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No images uploaded",
      });
    }

    if (product.images.length + req.files.length > 5) {
      return res.status(400).json({
        message: `Cannot upload ${req.files.length} image(s). Product already has ${product.images.length}, and the maximum is 5.`,
      });
    }

    const uploadedImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    product.images.push(...uploadedImages);

    await product.save();

    // Return the FULL product (not just the images array) so the frontend
    // always has product._id available for any follow-up action (like an
    // immediate image delete) in the same edit session.
    res.status(200).json({
      message: "Images uploaded successfully",
      product,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// delete product image
const deleteProductImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.images.length === 1) {
      return res.status(400).json({
        message:
          "Cannot delete the last image. A product must have at least one image.",
      });
    }

    const image = product.images.id(imageId);

    if (!image) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    await cloudinary.uploader.destroy(image.publicId);

    image.deleteOne();

    await product.save();

    res.status(200).json({
      message: "Image deleted successfully",
      product,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  getLowStockProducts,
  deleteProductById,
  getArchivedProducts,
  restoreProduct,
  increaseStock,
  reduceStock,
  uploadProductImages,
  deleteProductImage,
};
