const express = require("express");
const router = express.Router();

const {
  handleNewUser,
  handleNewLogin,
  handleRefreshToken,
  handleLogout,
} = require("../controllers/authController");

router.post("/register", handleNewUser);
router.post("/login", handleNewLogin);
router.get("/refresh", handleRefreshToken);
router.post("/logout", handleLogout);

module.exports = router;
