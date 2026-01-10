const pool = require('../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Missing email or password" });
  }

  try {
    // ✅ Emergency Login
    if (email === process.env.EMERGENCY_EMAIL && password === process.env.EMERGENCY_PASSWORD) {
      console.log("Emergency login triggered for:", email);

      // ค้นหา ID ของคนที่เป็น r1 มาสักคนเพื่อใช้สวมรอย
      const adminResult = await pool.query("SELECT * FROM users WHERE roleid = 'r1' LIMIT 1");
      const adminUser = adminResult.rows[0] || { user_id: "0", name: "Super Admin (Emergency)" };

      const token = jwt.sign(
        { email: email, roleid: "r1", user_id: adminUser.user_id },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      return res.json({
        success: true,
        message: "Emergency Login (As Admin) successful",
        token,
        user: {
          email: email,
          roleid: "r1",
          user_id: adminUser.user_id,
          name: adminUser.name,
        },
      });
    }

    // ✅ ค้นหาผู้ใช้จาก email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // ✅ ตรวจสอบว่าผู้ใช้ถูกแบนหรือไม่
    if (user.reason) {
      return res.status(403).json({
        success: false,
        message: `บัญชีนี้ถูกระงับการใช้งาน เนื่องจาก: ${user.reason}`,
        blacklisted_date: user.blacklisted_date,
      });
    }

    // ✅ ตรวจสอบรหัสผ่าน
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // ✅ สร้าง JWT Token
    const token = jwt.sign(
      { email: user.email, roleid: user.roleid, user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" } // เพิ่มเป็น 8 ชม.
    );

    // ✅ ส่งกลับข้อมูลผู้ใช้
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        email: user.email,
        roleid: user.roleid,
        user_id: user.user_id,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { login };
