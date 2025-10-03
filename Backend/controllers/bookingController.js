const pool = require("../db/db");

const BookingController = {
  async getMine(req, res) {
    try {
      const userId = req.user?.user_id;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const result = await pool.query(
        `SELECT b.booking_id, b.date, b.time, b.status_id,
                b.description, b.transport_required,
                (COALESCE(b.cost,0)+COALESCE(b.service,0)+COALESCE(b.freight,0)) AS total_price,
                v.license_plate, v.model
         FROM bookings b
         JOIN vehicles v ON v.vehicle_id = b.vehicle_id
         WHERE v.user_id = $1
         ORDER BY b.date DESC, b.time DESC`,
        [userId]
      );
      res.json({ success: true, bookings: result.rows });
    } catch (err) {
      console.error("Get my bookings error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async getAll(req, res) {
    try {
      const result = await pool.query(
        `SELECT b.booking_id, b.date, b.time, b.status_id,
                b.description, b.transport_required,
                (COALESCE(b.cost,0)+COALESCE(b.service,0)+COALESCE(b.freight,0)) AS total_price,
                v.license_plate, v.model
         FROM bookings b
         JOIN vehicles v ON v.vehicle_id = b.vehicle_id
         ORDER BY b.date DESC, b.time DESC`
      );
      res.json({ success: true, bookings: result.rows });
    } catch (err) {
      console.error("Get all bookings error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async getById(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT b.*, v.license_plate, v.model
         FROM bookings b
         JOIN vehicles v ON v.vehicle_id = b.vehicle_id
         WHERE b.booking_id = $1`,
        [id]
      );
      if (!result.rowCount) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      res.json({ success: true, booking: result.rows[0] });
    } catch (err) {
      console.error("Get booking by ID error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async create(req, res) {
    try {
      const { vehicle_id, date, time, description, transport_required } = req.body;
      const insert = await pool.query(
        `INSERT INTO bookings (vehicle_id, date, time, status_id, description, transport_required)
         VALUES ($1,$2,$3,1,$4,$5) RETURNING *`,
        [vehicle_id, date, time, description, transport_required]
      );
      res.status(201).json({ success: true, booking: insert.rows[0] });
    } catch (err) {
      console.error("Create booking error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { status_id, description } = req.body;
    try {
      const result = await pool.query(
        `UPDATE bookings SET status_id=$1, description=$2 WHERE booking_id=$3 RETURNING *`,
        [status_id, description, id]
      );
      if (!result.rowCount) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      res.json({ success: true, booking: result.rows[0] });
    } catch (err) {
      console.error("Update booking error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ✅ DELETE (user = ของตัวเอง, admin = ทุกอัน)
async delete(req, res) {
  const { id } = req.params;
  const user = req.user;
  try {
    let del;

    // ถ้าเป็น admin (r1) → ลบได้ทุก booking
    if (user.roleid === "r1" || user.role === "r1" || user.role_id === "r1") {
      del = await pool.query(`DELETE FROM bookings WHERE booking_id=$1 RETURNING *`, [id]);
    } 
    // ถ้าเป็น user (r2) → ลบได้เฉพาะ booking ของตัวเอง
    else if (user.roleid === "r2" || user.role === "r2" || user.role_id === "r2") {
      del = await pool.query(
        `DELETE FROM bookings b
         USING vehicles v
         WHERE b.booking_id=$1
         AND b.vehicle_id = v.vehicle_id
         AND v.user_id=$2
         RETURNING b.*`,
        [id, user.user_id]
      );
    } else {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
    }

    if (!del || !del.rowCount) {
      return res.status(404).json({ success: false, message: "Booking not found or not authorized" });
    }

    res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    console.error("Delete booking error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
};

module.exports = BookingController;
