const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Salmax API Running");
});

module.exports = router;
