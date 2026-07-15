const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("salmax API Running");
});

module.exports = router;
