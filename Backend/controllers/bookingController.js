// controllers/bookingController.js
const pool = require("../db/db");

const BookingController = {
  // GET booking by ID + ดึง repair items
  async getById(req, res) {
    const { id } = req.params;
    try {
      // ดึงข้อมูล booking หลัก
      const bookingRes = await pool.query(
        `SELECT b.booking_id, b.vehicle_id, b.date, b.time, b.status_id,
                b.transport_required, b.description, b.cost, b.service, b.freight, b.slipfilename,
                (b.cost + b.service + b.freight) AS total_price
         FROM bookings b
         WHERE b.booking_id = $1`,
        [id]
      );

      if (!bookingRes.rowCount) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      const booking = bookingRes.rows[0];

      // ดึง repair_items ของ booking นี้
      const partsRes = await pool.query(
        `SELECT ri.repair_id, ri.part_id, ri.quantity, ri.unit_price,
                (ri.quantity * ri.unit_price) AS subtotal,
                p.name AS partname, p.marque
         FROM repair_items ri
         JOIN parts p ON p.part_id = ri.part_id
         JOIN bookings b ON b.repair_id = ri.repair_id
         WHERE b.booking_id = $1`,
        [id]
      );

      res.json({
        success: true,
        booking,
        repair_items: partsRes.rows,
      });
    } catch (err) {
      console.error("Get booking error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // GET bookings ทั้งหมด
  async getAll(req, res) {
    try {
      const result = await pool.query(
        `SELECT b.booking_id, b.vehicle_id, b.date, b.time, b.status_id,
                b.transport_required, b.description, b.cost, b.service, b.freight,
                (b.cost + b.service + b.freight) AS total_price
         FROM bookings b
         ORDER BY b.date DESC, b.time DESC`
      );

      res.json({ success: true, bookings: result.rows });
    } catch (err) {
      console.error("Get bookings error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // CREATE booking
  async create(req, res) {
    const { vehicle_id, date, time, status_id, transport_required, description, cost, service, freight, slipfilename, repair_id } = req.body;
    try {
      const insertRes = await pool.query(
        `INSERT INTO bookings (vehicle_id, date, time, status_id, transport_required, description, cost, service, freight, slipfilename, repair_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [vehicle_id, date, time, status_id, transport_required, description, cost, service, freight, slipfilename, repair_id]
      );

      res.status(201).json({ success: true, booking: insertRes.rows[0] });
    } catch (err) {
      console.error("Create booking error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // UPDATE booking
  async update(req, res) {
    const { id } = req.params;
    const { vehicle_id, date, time, status_id, transport_required, description, cost, service, freight, slipfilename, repair_id } = req.body;
    try {
      const updateRes = await pool.query(
        `UPDATE bookings
         SET vehicle_id=$1, date=$2, time=$3, status_id=$4,
             transport_required=$5, description=$6, cost=$7, service=$8, freight=$9, slipfilename=$10, repair_id=$11
         WHERE booking_id=$12
         RETURNING *`,
        [vehicle_id, date, time, status_id, transport_required, description, cost, service, freight, slipfilename, repair_id, id]
      );

      if (!updateRes.rowCount) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      res.json({ success: true, booking: updateRes.rows[0] });
    } catch (err) {
      console.error("Update booking error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // DELETE booking
  async delete(req, res) {
    const { id } = req.params;
    try {
      const delRes = await pool.query(`DELETE FROM bookings WHERE booking_id=$1 RETURNING *`, [id]);
      if (!delRes.rowCount) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      res.json({ success: true, message: "Booking deleted" });
    } catch (err) {
      console.error("Delete booking error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};

module.exports = BookingController;
