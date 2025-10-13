const pool = require("../db/db");

const BookingController = {
  // ===============================
  // ✅ ดึงรายการของผู้ใช้ (เฉพาะตัวเอง)
  // ===============================
  async getMine(req, res) {
    try {
      const userId = req.user?.user_id;
      if (!userId)
        return res.status(401).json({ success: false, message: "Unauthorized" });

      const result = await pool.query(
        `SELECT 
            b.booking_id, 
            b.date, 
            b.time, 
            b.status_id,
            b.description, 
            b.transport_required,
            (COALESCE(b.cost,0)+COALESCE(b.service,0)+COALESCE(b.freight,0)) AS total_price,
            v.license_plate, 
            v.model,
            u.name AS owner_name
         FROM bookings b
         JOIN vehicles v ON v.vehicle_id = b.vehicle_id
         JOIN users u ON v.user_id = u.user_id
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

  // ===============================
  // ✅ ดึงข้อมูลทั้งหมด (เฉพาะ Admin)
  // ===============================
  async getAll(req, res) {
    try {
      const result = await pool.query(`
        SELECT 
          b.booking_id,
          b.vehicle_id,
          b.date,
          b.time,
          b.status_id,
          b.description,
          b.transport_required,
          COALESCE(b.cost,0) AS cost,
          COALESCE(b.service,0) AS service,
          COALESCE(b.freight,0) AS freight,
          (COALESCE(b.cost,0)+COALESCE(b.service,0)+COALESCE(b.freight,0)) AS total_price,
          v.license_plate,
          v.model,
          u.name AS owner_name,
          u.email AS owner_email,
          u.phone AS owner_phone
        FROM bookings b
        JOIN vehicles v ON b.vehicle_id = v.vehicle_id
        JOIN users u ON v.user_id = u.user_id
        ORDER BY b.date DESC, b.time DESC;
      `);

      res.json({ success: true, bookings: result.rows });
    } catch (err) {
      console.error("Error fetching bookings:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ===============================
  // ✅ ดึงข้อมูลรายบุคคล (by ID)
  // ===============================
  async getById(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT 
          b.booking_id,
          b.vehicle_id,
          b.date,
          b.time,
          b.status_id,
          b.transport_required,
          b.repair_id,
          b.description,
          COALESCE(b.cost,0) AS cost,
          COALESCE(b.service,0) AS service,
          COALESCE(b.freight,0) AS freight,
          b.slipfilename,
          v.license_plate,
          v.model,
          u.name AS owner_name,
          u.email AS owner_email,
          u.phone AS owner_phone
        FROM bookings b
        JOIN vehicles v ON b.vehicle_id = v.vehicle_id
        JOIN users u ON v.user_id = u.user_id
        WHERE b.booking_id = $1`,
        [id]
      );

      if (!result.rowCount)
        return res.status(404).json({ success: false, message: "Booking not found" });

      res.json({ success: true, booking: result.rows[0] });
    } catch (err) {
      console.error("Get booking by ID error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ===============================
  // ✅ เพิ่มการจองใหม่ (User)
  // ===============================
  async create(req, res) {
    try {
      const { vehicle_id, date, time, description, transport_required } = req.body;
      const insert = await pool.query(
        `INSERT INTO bookings 
          (vehicle_id, date, time, status_id, description, transport_required)
         VALUES ($1, $2, $3, 1, $4, $5) 
         RETURNING *`,
        [vehicle_id, date, time, description, transport_required]
      );
      res.status(201).json({ success: true, booking: insert.rows[0] });
    } catch (err) {
      console.error("Create booking error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ===============================
  // ✅ อัปเดตสถานะ / ค่าแรง / ค่าส่ง / รายละเอียด
  // ===============================
  async update(req, res) {
    const { id } = req.params;
    const { status_id, description, service, freight } = req.body;

    try {
      // ดึงข้อมูลปัจจุบันมาก่อน
      const current = await pool.query(`SELECT * FROM bookings WHERE booking_id=$1`, [id]);
      if (!current.rowCount)
        return res.status(404).json({ success: false, message: "Booking not found" });

      const old = current.rows[0];

      // ถ้าไม่ได้ส่งค่ามา → ใช้ค่าเดิม
      const newStatus = status_id ?? old.status_id;
      const newDesc = description ?? old.description;
      const newService = service ?? old.service ?? 0;
      const newFreight = freight ?? old.freight ?? 0;

      // อัปเดต
      const result = await pool.query(
        `UPDATE bookings 
         SET status_id=$1, description=$2, service=$3, freight=$4 
         WHERE booking_id=$5 
         RETURNING *`,
        [newStatus, newDesc, newService, newFreight, id]
      );

      res.json({ success: true, booking: result.rows[0] });
    } catch (err) {
      console.error("Update booking error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ===============================
  // ✅ ลบการจอง (User ลบของตัวเอง / Admin ลบทั้งหมด)
  // ===============================
  async delete(req, res) {
    const { id } = req.params;
    const user = req.user;

    try {
      let del;

      // 🔹 Admin → ลบได้ทุกการจอง
      if (user.roleid === "r1" || user.role === "r1" || user.role_id === "r1") {
        del = await pool.query(
          `DELETE FROM bookings WHERE booking_id=$1 RETURNING *`,
          [id]
        );
      }
      // 🔹 User → ลบเฉพาะของตัวเอง
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
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: insufficient role" });
      }

      if (!del || !del.rowCount)
        return res
          .status(404)
          .json({ success: false, message: "Booking not found or not authorized" });

      res.json({ success: true, message: "Booking deleted" });
    } catch (err) {
      console.error("Delete booking error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};

module.exports = BookingController;
