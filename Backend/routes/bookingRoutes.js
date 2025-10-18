const express = require("express");
const path = require("path");
const multer = require("multer");
const pool = require("../db/db");
const { verifyToken } = require("../middleware/authenticateUser");
const BookingController = require("../controllers/bookingController");

const router = express.Router();

// 📁 ตั้งค่า multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => cb(null, "slip_" + Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ Upload Slip
// ✅ อัปโหลดสลิป (ลูกค้าอัปโหลดหลักฐานการชำระเงิน)
router.post("/:id/slip", verifyToken, upload.single("slip"), BookingController.uploadSlip);


// ✅ routes ปกติ
router.get("/mine", verifyToken, BookingController.getMine);
router.get("/", verifyToken, BookingController.getAll);
router.get("/:id", verifyToken, BookingController.getById);
router.post("/", verifyToken, BookingController.create);
router.put("/:id", verifyToken, BookingController.update);
router.delete("/:id", verifyToken, BookingController.delete);
router.put("/:id/cost", verifyToken, BookingController.updateCost);

// ✅ เพิ่ม route เปลี่ยนสถานะ
router.put("/:id/status", verifyToken, BookingController.updateStatus);

module.exports = router;
  