const pool = require("../db/db");

const Brand = {
  // GET all brands
  async getBrand(req, res) {
    try {
      const result = await pool.query("SELECT * FROM vehicle_brands ORDER BY id_Brand");
      res.status(200).json({ success: true, brands: result.rows });
    } catch (error) {
      console.error("Error fetching brands:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // GET brand by ID
  async getById(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query("SELECT * FROM vehicle_brands WHERE id_Brand = $1", [id]);
      if (!result.rowCount) {
        return res.status(404).json({ success: false, message: "Brand not found" });
      }
      res.json({ success: true, brand: result.rows[0] });
    } catch (error) {
      console.error("Error fetching brand by ID:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // CREATE new brand
  async createBrand(req, res) {
    const { name } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO vehicle_brands (name) VALUES ($1) RETURNING *",
        [name]
      );
      res.status(201).json({ success: true, brand: result.rows[0] });
    } catch (error) {
      console.error("Error creating brand:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // UPDATE brand
  async updateBrand(req, res) {
    const { id } = req.params;
    const { name } = req.body;
    try {
      const result = await pool.query(
        "UPDATE vehicle_brands SET name = $1 WHERE id_Brand = $2 RETURNING *",
        [name, id]
      );
      if (!result.rowCount) {
        return res.status(404).json({ success: false, message: "Brand not found" });
      }
      res.json({ success: true, brand: result.rows[0] });
    } catch (error) {
      console.error("Error updating brand:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // DELETE brand
  async deleteBrand(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query(
        "DELETE FROM vehicle_brands WHERE id_Brand = $1 RETURNING *",
        [id]
      );
      if (!result.rowCount) {
        return res.status(404).json({ success: false, message: "Brand not found" });
      }
      res.json({ success: true, message: "Brand deleted successfully" });
    } catch (error) {
      console.error("Error deleting brand:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};

module.exports = { Brand };
