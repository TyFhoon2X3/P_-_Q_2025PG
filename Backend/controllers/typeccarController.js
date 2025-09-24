const pool = require("../db/db");

const type = {
  async getTypeCar(req, res) {
    try {
      const result = await pool.query("SELECT * FROM vehicle_types ORDER BY id_type");
      res.status(200).json({ success: true, typecar: result.rows });
    } catch (error) {
      console.error("Error fetching typecar:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async getById(req, res) {
    const { id } = req.params;

    try {
      const result = await pool.query(
        "SELECT * FROM vehicle_types WHERE id_type = $1",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: "Type not found" });
      }

      res.status(200).json({ success: true, type: result.rows[0] });
    } catch (err) {
      console.error("Get type by ID error:", err.message);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async createTypeCar(req, res) {
    const { type_name } = req.body;

    try {
      const result = await pool.query(
        "INSERT INTO vehicle_types (type_name) VALUES ($1) RETURNING *",
        [type_name]
      );

      res.status(201).json({ success: true, type: result.rows[0] });
    } catch (err) {
      console.error("Create typecar error:", err.message);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async updateTypeCar(req, res) {
    const { id } = req.params;
    const { type_name } = req.body;

    try {
      const result = await pool.query(
        "UPDATE vehicle_types SET type_name = $1 WHERE id_type = $2 RETURNING *",
        [type_name, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: "Type not found" });
      }

      res.status(200).json({ success: true, type: result.rows[0] });
    } catch (err) {
      console.error("Update typecar error:", err.message);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  async deleteTypeCar(req, res) {
    const { id } = req.params;

    try {
      const result = await pool.query(
        "DELETE FROM vehicle_types WHERE id_type = $1 RETURNING *",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: "Type not found" });
      }

      res.status(200).json({ success: true, message: "Type deleted successfully" });
    } catch (err) {
      console.error("Delete typecar error:", err.message);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

};

module.exports = { type };