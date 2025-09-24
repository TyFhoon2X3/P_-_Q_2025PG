const express = require("express");
const router = express.Router();
const { getProfile } = require("../controllers/ProfileController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getProfile);

module.exports = router;
