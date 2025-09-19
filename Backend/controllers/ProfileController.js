const pool = require("../db/db");

const getProfile = async (req, res) => {
    try {
        // req.user มาจาก JWT middleware
        const { email } = req.user;

        const result = await pool.query("SELECT user_id, name, email,password,roleid, phone, address FROM users WHERE email = $1", [email]);

        if (!result.rowCount) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, profile: result.rows[0] });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { getProfile };
