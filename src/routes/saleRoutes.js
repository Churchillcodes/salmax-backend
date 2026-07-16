const express = require("express");
const router = express.Router();

const {
  getAllSales,
  getSaleById,
  getTopProducts,
  getRevenueTrends,
  getSalesBreakdown,
  getCustomerHistory,
} = require("../controllers/saleController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

router.get(
  "/analytics/top-products",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  getTopProducts,
);

router.get(
  "/analytics/revenue-trends",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  getRevenueTrends,
);

router.get(
  "/analytics/sales-breakdown",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  getSalesBreakdown,
);

router.get(
  "/analytics/customer-history",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  getCustomerHistory,
);

router.get("/", verifyJWT, verifyRoles(ROLES_LIST.Admin), getAllSales);

router.get("/:id", verifyJWT, verifyRoles(ROLES_LIST.Admin), getSaleById);

module.exports = router;
