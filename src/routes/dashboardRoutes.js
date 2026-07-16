const express = require("express");
const router = express.Router();

const {
  getDashboardSummary,
  getRevenueAnalytics,
  getLeadAnalytics,
} = require("../controllers/dashboardController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

router.get(
  "/summary",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  getDashboardSummary,
);

router.get(
  "/revenue",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  getRevenueAnalytics,
);

router.get(
  "/leads",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  getLeadAnalytics,
);

module.exports = router;
