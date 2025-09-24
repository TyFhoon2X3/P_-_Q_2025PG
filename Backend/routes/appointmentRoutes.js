const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// POST /api/appointments
router.post("/", async (req, res) => {
  const { vehicle_id, license_plate, id_type, id_brand, date, time, needsDelivery } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO appointments (vehicle_id, license_plate, id_type, id_brand, date, time, needs_delivery)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [vehicle_id, license_plate, id_type, id_brand, date, time, needsDelivery]
    );
    res.status(201).json({ success: true, appointment: result.rows[0] });
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});


module.exports = router;