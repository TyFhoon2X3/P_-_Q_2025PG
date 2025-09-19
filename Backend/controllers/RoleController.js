const pool = require("../db/db");
const RoleController = {
  async GetRole(req, res) {
    try {
      const result = await pool.query("SELECT * FROM role ORDER BY roleid");
      res.status(200).json({ success: true, parts: result.rows });
    } catch (error) {
      console.error("Error fetching role:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
  
    async GetRoleById(req, res) {  
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM role WHERE roleid = $1', [id]);     
    } catch (err) {
      console.error('Get role by ID error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
},
};

module.exports = { RoleController };
