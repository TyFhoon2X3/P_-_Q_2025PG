const pool = require("../db/db");

const CustomerController = {
  // GET all customers
  async getCustomers(req, res) {
    try {
      const result = await pool.query("SELECT * FROM users ORDER BY user_id");
      res.status(200).json({ success: true, customers: result.rows });
    } catch (error) {
      console.error("Error fetching customers:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // GET customer by ID
  async getById(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
      if (!result.rowCount) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }
      res.json({ success: true, customer: result.rows[0] });
    } catch (error) {
      console.error("Error fetching customer by ID:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // CREATE new customer
  async createCustomer(req, res) {
    const { name, email, password, phone, roleid, address } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO users (name, email, password, phone, roleid, address) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, email, password, phone, roleid, address]
      );
      res.status(201).json({ success: true, customer: result.rows[0] });
    } catch (error) {
      console.error("Error creating customer:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // UPDATE customer
  async updateCustomer(req, res) {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    try {
      const result = await pool.query(
        `UPDATE users 
         SET name = $1, email = $2, phone = $3, address = $4 
         WHERE user_id = $5 RETURNING *`,
        [name, email, phone, address, id]
      );
      if (!result.rowCount) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }
      res.json({ success: true, customer: result.rows[0] });
    } catch (error) {
      console.error("Error updating customer:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // DELETE customer
  async deleteCustomer(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query("DELETE FROM users WHERE user_id = $1 RETURNING *", [id]);
      if (!result.rowCount) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }
      res.json({ success: true, message: "Customer deleted successfully" });
    } catch (error) {
      console.error("Error deleting customer:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};

module.exports = CustomerController;
