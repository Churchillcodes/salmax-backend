const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

router.get("/", verifyJWT, verifyRoles(ROLES_LIST.Admin), getAllOrders);

router.get("/:id", verifyJWT, verifyRoles(ROLES_LIST.Admin), getOrderById);

router.post("/", verifyJWT, verifyRoles(ROLES_LIST.Admin), createOrder);

router.patch(
  "/:id/status",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  updateOrderStatus,
);

router.patch(
  "/:id/cancel",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  cancelOrder,
);

module.exports = router;
