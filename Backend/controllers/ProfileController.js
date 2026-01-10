const pool = require("../db/db");
const bcrypt = require("bcrypt");

const getProfile = async (req, res) => {
    try {
        const { email } = req.user;
        const result = await pool.query(
            "SELECT user_id, name, email, roleid, phone, address FROM users WHERE email = $1",
            [email]
        );

        if (!result.rowCount) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, profile: result.rows[0] });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { name, phone, address } = req.body;

        const result = await pool.query(
            "UPDATE users SET name = $1, phone = $2, address = $3 WHERE user_id = $4 RETURNING user_id, name, email, roleid, phone, address",
            [name, phone, address, user_id]
        );

        if (!result.rowCount) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "อัปเดตข้อมูลส่วนตัวสำเร็จ",
            profile: result.rows[0],
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const changePassword = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { currentPassword, newPassword } = req.body;

        // 1. ตรวจสอบรหัสผ่านเดิม
        const userResult = await pool.query("SELECT password FROM users WHERE user_id = $1", [user_id]);
        if (!userResult.rowCount) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const match = await bcrypt.compare(currentPassword, userResult.rows[0].password);
        if (!match) {
            return res.status(400).json({ success: false, message: "รหัสผ่านเดิมไม่ถูกต้อง" });
        }

        // 2. Hash รหัสผ่านใหม่
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        // 3. บันทึก
        await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [hashed, user_id]);

        res.status(200).json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { getProfile, updateProfile, changePassword };
