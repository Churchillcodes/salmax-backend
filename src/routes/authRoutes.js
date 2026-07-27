const express = require("express");
const router = express.Router();

const {
  handleNewUser,
  handleNewLogin,
  handleRefreshToken,
  handleLogout,
} = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

router.post(
  "/register",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  authLimiter,
  handleNewUser,
);
router.post("/login", authLimiter, handleNewLogin);
router.get("/refresh", handleRefreshToken);
router.post("/logout", handleLogout);

module.exports = router;
