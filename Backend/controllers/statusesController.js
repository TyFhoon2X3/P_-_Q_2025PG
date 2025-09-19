const pool = require("../db/db");
const statusesController = {
    async getStatuses(req, res) {
        try {
            const result = await pool.query("SELECT * FROM statuses ORDER BY status_id");
            res.status(200).json({ success: true, statuses: result.rows });
        }
        catch (error) {
            console.error("Error fetching statuses:", error.message);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },
    async getById(req, res) {
        const { id } = req.params;
        try {
            const result = await pool.query("SELECT * FROM statuses WHERE status_id = $1", [id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: "Status not found" });
            }
            res.status(200).json({ success: true, status: result.rows[0] });
        } catch (err) {
            console.error("Get status by ID error:", err.message);
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    }
};
module.exports = { statusesController };
