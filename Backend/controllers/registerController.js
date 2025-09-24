const pool = require("../db/db");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  if (!req.body) {
    return res
      .status(400)
      .json({ success: false, message: "Missing request body" });
  }

  // ถ้า req.body ไม่ใช่ Array ให้เปลี่ยนเป็น Array ของ object เดียว
  const users = Array.isArray(req.body) ? req.body : [req.body];

  try {
    for (const user of users) {
      const { name, email, password, phone, address } = user;

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!email || !password || !name) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      // ตรวจสอบ email ซ้ำ
      const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (existing.rows.length > 0) {
        return res
          .status(409)
          .json({ success: false, message: `Email already registered: ${email}` });
      }

      // เข้ารหัสรหัสผ่าน
      const hashedPassword = await bcrypt.hash(password, 10);

      // กำหนด roleid เป็น "r2" (customer)
      const defaultRoleId = "r2";

      // บันทึกลงฐานข้อมูล
      await pool.query(
        `INSERT INTO users (name, email, password, roleid, phone, address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [name, email, hashedPassword, defaultRoleId, phone || null, address || null]
      );
    }

    res
      .status(201)
      .json({ success: true, message: "Users registered successfully" });
  } catch (error) {
    console.error("Register error:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { register };
