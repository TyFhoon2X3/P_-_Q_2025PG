// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/bookingController");

// GET booking by ID
router.get("/:id", BookingController.getById);

// ภายหลังจะเพิ่ม CRUD อื่น ๆ
router.get("/", BookingController.getAll);
router.post("/", BookingController.create);
router.put("/:id", BookingController.update);
router.delete("/:id", BookingController.delete);

module.exports = router;
