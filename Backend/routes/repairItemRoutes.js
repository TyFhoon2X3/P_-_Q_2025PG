const express = require("express");
const router = express.Router();
const RepairItemsController = require("../controllers/repairItemsController");
const { verifyToken } = require("../middleware/authenticateUser");

// ✅ ดึงอุปกรณ์ทั้งหมดของการจอง
router.get("/:booking_id", verifyToken, RepairItemsController.getByBooking);

// ✅ เพิ่มอุปกรณ์ (ลดสต็อก)
router.post("/", verifyToken, RepairItemsController.addItem);

// ✅ ลบอุปกรณ์ (คืนสต็อก)
router.delete("/:booking_id/:part_id", verifyToken, RepairItemsController.deleteItem);

module.exports = router;
