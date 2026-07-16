const express = require("express");
const router = express.Router();

const { createLead, getAllLeads } = require("../controllers/leadController");

const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

// PUBLIC
router.post("/", createLead);

// ADMIN
router.get("/", verifyJWT, verifyRoles(ROLES_LIST.Admin), getAllLeads);

module.exports = router;
