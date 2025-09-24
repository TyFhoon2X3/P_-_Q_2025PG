const pool = require("../db/db");

const VehiclesController = {
  // CREATE vehicle
  async create(req, res) {
    const { license_plate, model, id_brand, id_type } = req.body;
    const user_id = req.user.user_id; // ✅ ดึงจาก JWT

    try {
      // ตรวจสอบ FK
      const [brand, type] = await Promise.all([
        pool.query("SELECT 1 FROM vehicle_brands WHERE id_brand = $1", [id_brand]),
        pool.query("SELECT 1 FROM vehicle_types WHERE id_type = $1", [id_type]),
      ]);

      if (!brand.rowCount) return res.status(400).json({ error: "Invalid id_brand" });
      if (!type.rowCount) return res.status(400).json({ error: "Invalid id_type" });

      const result = await pool.query(
        `INSERT INTO vehicles (user_id, license_plate, id_brand, model, id_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [user_id, license_plate, id_brand, model, id_type]
      );

      res.status(201).json({ success: true, vehicle: result.rows[0] });
    } catch (err) {
      if (err.code === "23505") {
        res.status(409).json({ error: "License plate already exists" });
      } else {
        console.error("Create vehicle error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  // GET vehicles ทั้งหมด (admin)
  async getAll(req, res) {
    try {
      const result = await pool.query(
        `SELECT v.vehicle_id, v.license_plate, v.model,
                v.id_brand, v.id_type,       -- ✅ ส่ง id_brand, id_type
                u.name AS owner_name, b.brandname, t.typename
         FROM vehicles v
         JOIN users u ON v.user_id = u.user_id
         JOIN vehicle_brands b ON v.id_brand = b.id_brand
         JOIN vehicle_types t ON v.id_type = t.id_type
         ORDER BY v.vehicle_id`
      );
      res.json({ success: true, vehicles: result.rows });
    } catch (err) {
      console.error("Get vehicles error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // GET vehicles ของ user (JWT)
  async getMine(req, res) {
    try {
      const userId = req.user.user_id;
      const result = await pool.query(
        `SELECT v.vehicle_id, v.license_plate, v.model,
                v.id_brand, v.id_type,       -- ✅ ส่ง id_brand, id_type
                b.brandname, t.typename
         FROM vehicles v
         JOIN vehicle_brands b ON v.id_brand = b.id_brand
         JOIN vehicle_types t ON v.id_type = t.id_type
         WHERE v.user_id = $1
         ORDER BY v.vehicle_id DESC`,
        [userId]
      );
      res.json({ success: true, vehicles: result.rows });
    } catch (err) {
      console.error("Get my vehicles error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // GET by ID
  async getById(req, res) {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Vehicle ID ต้องเป็นตัวเลข" });
    }

    try {
      const result = await pool.query(
        "SELECT * FROM vehicles WHERE vehicle_id = $1",
        [parseInt(id)]
      );
      if (!result.rowCount) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json({ success: true, vehicle: result.rows[0] });
    } catch (err) {
      console.error("Get vehicle by ID error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // UPDATE
  async update(req, res) {
    const { id } = req.params;
    const { license_plate, model, id_brand, id_type } = req.body;

    try {
      // ✅ เช็คเจ้าของก่อน
      const check = await pool.query("SELECT user_id FROM vehicles WHERE vehicle_id = $1", [id]);
      if (!check.rowCount) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      if (req.user.roleid !== "r1" && check.rows[0].user_id !== req.user.user_id) {
        return res.status(403).json({ error: "Forbidden: not your vehicle" });
      }

      const result = await pool.query(
        `UPDATE vehicles
         SET license_plate=$1, model=$2, id_brand=$3, id_type=$4
         WHERE vehicle_id=$5
         RETURNING *`,
        [license_plate, model, id_brand, id_type, id]
      );

      res.json({ success: true, vehicle: result.rows[0] });
    } catch (err) {
      if (err.code === "23505") {
        res.status(409).json({ error: "License plate already exists" });
      } else {
        console.error("Update vehicle error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  // DELETE
  async delete(req, res) {
    const { id } = req.params;
    try {
      // ✅ เช็คเจ้าของก่อน
      const check = await pool.query("SELECT user_id FROM vehicles WHERE vehicle_id = $1", [id]);
      if (!check.rowCount) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      if (req.user.roleid !== "r1" && check.rows[0].user_id !== req.user.user_id) {
        return res.status(403).json({ error: "Forbidden: not your vehicle" });
      }

      const result = await pool.query(
        "DELETE FROM vehicles WHERE vehicle_id=$1 RETURNING *",
        [id]
      );

      res.json({ success: true, message: "Vehicle deleted", deleted: result.rows[0] });
    } catch (err) {
      console.error("Delete vehicle error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = VehiclesController;
