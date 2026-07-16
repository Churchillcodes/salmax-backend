const express = require("express");
const router = express.Router();

const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

// PUBLIC - storefront needs this to render category filters
router.get("/", getAllCategories);

// ADMIN
router.post("/", verifyJWT, verifyRoles(ROLES_LIST.Admin), createCategory);
router.patch("/:id", verifyJWT, verifyRoles(ROLES_LIST.Admin), updateCategory);
router.delete("/:id", verifyJWT, verifyRoles(ROLES_LIST.Admin), deleteCategory);

module.exports = router;
