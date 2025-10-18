const pool = require("../db/db");

const BookingController = {
  // ✅ ดึงรายการของผู้ใช้
  // ✅ ดึงรายการของผู้ใช้
  async getMine(req, res) {
    try {
      const userId = req.user?.user_id;
      if (!userId)
        return res.status(401).json({ success: false, message: "Unauthorized" });

      const result = await pool.query(`
      SELECT 
        b.booking_id, b.date, b.time,
        b.status_id, s.status_name,   -- ✅ เพิ่มชื่อสถานะ
        b.description, b.transport_required,
        COALESCE(b.cost,0)+COALESCE(b.service,0)+COALESCE(b.freight,0) AS total_price,
        b.slipfilename,
        v.license_plate, v.model,
        u.name AS owner_name
      FROM bookings b
      JOIN vehicles v ON v.vehicle_id = b.vehicle_id
      JOIN users u ON v.user_id = u.user_id
      LEFT JOIN statuses s ON s.status_id = b.status_id   -- ✅ JOIN ตาราง statuses
      WHERE v.user_id = $1
      ORDER BY b.date DESC, b.time DESC;
    `, [userId]);

      res.json({ success: true, bookings: result.rows });
    } catch (err) {
      console.error("Get my bookings error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },


  // ✅ ดึงทั้งหมด (Admin)
  // ✅ ดึงทั้งหมด (Admin)
  async getAll(req, res) {
    try {
      const result = await pool.query(`
      SELECT 
        b.booking_id, b.vehicle_id, b.date, b.time,
        b.status_id, s.status_name,        -- ✅ เพิ่มสถานะ
        b.description, b.transport_required, b.slipfilename,
        COALESCE(b.cost,0) AS cost,
        COALESCE(b.service,0) AS service,
        COALESCE(b.freight,0) AS freight,
        (COALESCE(b.cost,0)+COALESCE(b.service,0)+COALESCE(b.freight,0)) AS total_price,
        v.license_plate, v.model,
        u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      JOIN users u ON v.user_id = u.user_id
      LEFT JOIN statuses s ON s.status_id = b.status_id  -- ✅ JOIN ตาราง statuses
      ORDER BY b.date DESC, b.time DESC;
    `);

      res.json({ success: true, bookings: result.rows });
    } catch (err) {
      console.error("Error fetching bookings:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ✅ ดึงรายละเอียดราย ID
  async getById(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT 
          b.*, v.license_plate, v.model, u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
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

  // ✅ สร้างงานซ่อมใหม่
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

  // ✅ อัปเดตสถานะ
  async update(req, res) {
    const { id } = req.params;
    const { status_id, description, service, freight } = req.body;
    try {
      const current = await pool.query(`SELECT * FROM bookings WHERE booking_id=$1`, [id]);
      if (!current.rowCount)
        return res.status(404).json({ success: false, message: "Booking not found" });

      const old = current.rows[0];
      const newStatus = status_id ?? old.status_id;
      const newDesc = description ?? old.description;
      const newService = service ?? old.service ?? 0;
      const newFreight = freight ?? old.freight ?? 0;

      const result = await pool.query(
        `UPDATE bookings 
         SET status_id=$1, description=$2, service=$3, freight=$4 
         WHERE booking_id=$5 RETURNING *`,
        [newStatus, newDesc, newService, newFreight, id]
      );
      res.json({ success: true, booking: result.rows[0] });
    } catch (err) {
      console.error("Update booking error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ✅ อัปโหลดสลิป (เปลี่ยนสถานะเป็น “เสร็จแล้ว”)
  async uploadSlip(req, res) {
    try {
      const { id } = req.params;
      const filename = req.file?.filename;
      if (!filename) return res.status(400).json({ success: false, message: "No file uploaded" });

      await pool.query(
        `UPDATE bookings SET slipfilename=$1, status_id=3 WHERE booking_id=$2`,
        [filename, id]
      );

      res.json({ success: true, message: "อัปโหลดสลิปสำเร็จ", filename });
    } catch (err) {
      console.error("Upload slip error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ✅ ลบงานซ่อม
  async delete(req, res) {
    const { id } = req.params;
    try {
      await pool.query(`DELETE FROM bookings WHERE booking_id=$1`, [id]);
      res.json({ success: true, message: "Booking deleted" });
    } catch (err) {
      console.error("Delete booking error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },// ✅ อัปเดตค่าใช้จ่าย (freight + service)
  async updateCost(req, res) {
    const { id } = req.params;
    const { freight = 0, service = 0 } = req.body;

    try {
      // ตรวจสอบว่ามี booking จริงไหม
      const check = await pool.query(`SELECT * FROM bookings WHERE booking_id=$1`, [id]);
      if (!check.rowCount)
        return res.status(404).json({ success: false, message: "ไม่พบบุ๊คกิ้งนี้" });

      // อัปเดตค่าใช้จ่าย
      await pool.query(
        `UPDATE bookings 
       SET freight=$1, service=$2 
       WHERE booking_id=$3`,
        [freight, service, id]
      );

      res.json({ success: true, message: "อัปเดตค่าใช้จ่ายสำเร็จ" });
    } catch (err) {
      console.error("💰 Update cost error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
  // ✅ เปลี่ยนสถานะงานซ่อม (เฉพาะ status_id)
  async updateStatus(req, res) {
    const { id } = req.params;
    const { status_id } = req.body;

    try {
      const check = await pool.query(`SELECT * FROM bookings WHERE booking_id=$1`, [id]);
      if (!check.rowCount)
        return res.status(404).json({ success: false, message: "ไม่พบบุ๊คกิ้งนี้" });

      await pool.query(`UPDATE bookings SET status_id=$1 WHERE booking_id=$2`, [status_id, id]);
      res.json({ success: true, message: "อัปเดตสถานะสำเร็จ" });
    } catch (err) {
      console.error("🔄 Update status error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

};

module.exports = BookingController;
