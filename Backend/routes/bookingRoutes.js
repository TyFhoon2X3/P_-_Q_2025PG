const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/bookingController");
const { verifyToken } = require("../middleware/authenticateUser");

// ✅ แค่ verifyToken พอ ไม่ต้อง authorizeRoles
router.get("/mine", verifyToken, BookingController.getMine);
router.get("/", verifyToken, BookingController.getAll);
router.get("/:id", verifyToken, BookingController.getById);
router.post("/", verifyToken, BookingController.create);
router.put("/:id", verifyToken, BookingController.update);
router.delete("/:id", verifyToken, BookingController.delete);

module.exports = router;
