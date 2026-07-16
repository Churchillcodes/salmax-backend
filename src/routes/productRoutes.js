const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createProduct,
  getAllProducts,
  getProductById,
  getLowStockProducts,
  deleteProductById,
  updateProductById,
  getArchivedProducts,
  restoreProduct,
  increaseStock,
  reduceStock,
  uploadProductImages,
  deleteProductImage,
} = require("../controllers/productController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

// PUBLIC - supports ?productType=&group=&category= query filters
router.get("/", getAllProducts);

router.get(
  "/archived",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  getArchivedProducts,
);

router.get(
  "/low-stock",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  getLowStockProducts,
);

router.get("/:id", getProductById);

router.post("/", verifyJWT, verifyRoles(ROLES_LIST.Admin), createProduct);

router.patch(
  "/:id",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  updateProductById,
);

router.post(
  "/:id/images",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  upload.array("images", 5),
  uploadProductImages,
);

router.delete(
  "/:id/images/:imageId",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  deleteProductImage,
);

router.patch(
  "/:id/restore",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  restoreProduct,
);

// body: { size: "42", quantity: 5 }
router.patch(
  "/:id/increase-stock",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  increaseStock,
);

// body: { size: "42", quantity: 2 }
router.patch(
  "/:id/reduce-stock",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  reduceStock,
);

router.delete(
  "/:id",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  deleteProductById,
);

module.exports = router;
