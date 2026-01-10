const pool = require("../db/db");

const ReviewController = {
    // ✅ สร้างรีวิวใหม่
    async createReview(req, res) {
        try {
            const { booking_id, rating, comment } = req.body;
            const user_id = req.user.user_id;

            // ตรวจสอบว่ามีงานซ่อมนี้จริงและเป็นของยูสเซอร์นี้ + สถานะต้องเสร็จแล้ว (3)
            const booking = await pool.query(
                "SELECT * FROM bookings WHERE booking_id = $1 AND status_id = 3",
                [booking_id]
            );

            if (!booking.rowCount) {
                return res.status(400).json({ success: false, message: "งานซ่อมยังไม่เสร็จสิ้น หรือไม่พบข้อมูล" });
            }

            // ตรวจสอบว่าเคยรีวิวไปยัง
            const existing = await pool.query("SELECT * FROM reviews WHERE booking_id = $1", [booking_id]);
            if (existing.rowCount) {
                return res.status(400).json({ success: false, message: "คุณเคยรีวิวง่ายซ่อมนี้ไปแล้ว" });
            }

            const result = await pool.query(
                "INSERT INTO reviews (booking_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
                [booking_id, user_id, rating, comment]
            );

            res.status(201).json({ success: true, review: result.rows[0] });
        } catch (error) {
            console.error("Create review error:", error.message);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    // ✅ ดึงรีวิวของงานซ่อม
    async getByBooking(req, res) {
        try {
            const { id } = req.params;
            const result = await pool.query("SELECT * FROM reviews WHERE booking_id = $1", [id]);
            res.json({ success: true, review: result.rows[0] || null });
        } catch (error) {
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    // ✅ ดึงรีวิวทั้งหมด (Admin)
    async getAllReviews(req, res) {
        try {
            const result = await pool.query(`
        SELECT r.*, u.name as reviewer_name, b.date, v.model
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        JOIN bookings b ON r.booking_id = b.booking_id
        JOIN vehicles v ON b.vehicle_id = v.vehicle_id
        ORDER BY r.created_at DESC
      `);
            res.json({ success: true, reviews: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: "Server error" });
        }
    }
};

module.exports = ReviewController;
