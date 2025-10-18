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
router.post("/:id/slip", verifyToken, upload.single("slip"), async (req, res) => {
  try {
    const { id } = req.params;
    const filename = req.file?.filename;
    const userId = req.user.user_id;

    if (!filename) return res.status(400).json({ success: false, message: "ไม่พบไฟล์" });

    const check = await pool.query(`
      SELECT b.booking_id, b.status_id, v.user_id 
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      WHERE b.booking_id = $1
    `, [id]);

    if (!check.rowCount) return res.status(404).json({ success: false, message: "ไม่พบบุ๊คกิ้งนี้" });
    const booking = check.rows[0];

    if (booking.user_id !== userId)
      return res.status(403).json({ success: false, message: "ไม่อนุญาต" });

    if (booking.status_id !== 5)
      return res.status(400).json({ success: false, message: "อัปโหลดได้เมื่อสถานะเสร็จแล้ว" });

    await pool.query(`UPDATE bookings SET slipfilename=$1 WHERE booking_id=$2`, [filename, id]);
    res.json({ success: true, message: "อัปโหลดสำเร็จ", filename });
  } catch (err) {
    console.error("❌ Upload slip error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ routes ปกติ
router.get("/mine", verifyToken, BookingController.getMine);
// router.get("/", verifyToken, BookingController.getAll);
router.get("/:id", verifyToken, BookingController.getById);
router.post("/", verifyToken, BookingController.create);
router.put("/:id", verifyToken, BookingController.update);
router.delete("/:id", verifyToken, BookingController.delete);
router.put("/:id/cost", verifyToken, BookingController.updateCost);

// ✅ เพิ่ม route เปลี่ยนสถานะ
router.put("/:id/status", verifyToken, BookingController.updateStatus);

module.exports = router;
  