const express = require("express");
const ReviewController = require("../controllers/reviewController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, ReviewController.createReview);
router.get("/booking/:id", verifyToken, ReviewController.getByBooking);
router.get("/all", verifyToken, ReviewController.getAllReviews);

module.exports = router;
