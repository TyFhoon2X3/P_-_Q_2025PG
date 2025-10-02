const pool = require("../db/db");


const generatePartId = async () => {
  const result = await pool.query("SELECT part_id FROM parts ORDER BY part_id DESC LIMIT 1");
  const lastId = result.rows[0]?.part_id || "P000"; // เริ่มจาก P000 ถ้าไม่มี
  const newIdNum = parseInt(lastId.slice(1)) + 1;
  return "P" + newIdNum.toString().padStart(3, "0"); // เช่น P001, P002
};

const PartsController = {
  // GET all parts
  async getParts(req, res) {
    try {300065

      
      const result = await pool.query("SELECT * FROM parts ORDER BY part_id");
      res.status(200).json({ success: true, parts: result.rows });
    } catch (error) {
      console.error("Error fetching parts:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // GET part by ID
  async getById(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query("SELECT * FROM parts WHERE part_id = $1", [id]);
      if (!result.rowCount) {
        return res.status(404).json({ success: false, message: "Part not found" });
      }
      res.json({ success: true, part: result.rows[0] });
    } catch (err) {
      console.error("Get part by ID error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // CREATE new part
  async createPart(req, res) {
    const { name, marque, quantity, unit_price } = req.body;
    try {
      const part_id = await generatePartId();
      const result = await pool.query(
        "INSERT INTO parts (part_id, name, marque, quantity, unit_price) VALUES ($1,$2,$3,$4,$5) RETURNING *",
        [part_id, name, marque, quantity, unit_price]
      );
      res.status(201).json({ success: true, part: result.rows[0] });
    } catch (err) {
      console.error("Create part error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // UPDATE part
  async updatePart(req, res) {
    const { id } = req.params;
    const { name, marque, quantity, unit_price } = req.body;
    try {
      const result = await pool.query(
        "UPDATE parts SET name=$1, marque=$2, quantity=$3, unit_price=$4 WHERE part_id=$5 RETURNING *",
        [name, marque, quantity, unit_price, id]
      );
      if (!result.rowCount) {
        return res.status(404).json({ success: false, message: "Part not found" });
      }
      res.json({ success: true, part: result.rows[0] });
    } catch (err) {
      console.error("Update part error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // DELETE part
  async deletePart(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query("DELETE FROM parts WHERE part_id=$1 RETURNING *", [id]);
      if (!result.rowCount) {
        return res.status(404).json({ success: false, message: "Part not found" });
      }
      res.json({ success: true, message: "Part deleted successfully" });
    } catch (err) {
      console.error("Delete part error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
};

module.exports = { PartsController };
