const express = require("express");
const router = express.Router();
const {
    getProfile,
    updateProfile,
    changePassword,
} = require("../controllers/ProfileController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getProfile);
router.put("/", authenticateToken, updateProfile);
router.put("/change-password", authenticateToken, changePassword);

module.exports = router;
