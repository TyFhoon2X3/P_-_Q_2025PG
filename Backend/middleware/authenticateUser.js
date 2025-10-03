// middleware/authenticateUser.js
const jwt = require("jsonwebtoken");

// ตรวจสอบ JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
    req.user = decoded; 
    next();
  });
}

// ตรวจสอบ Role
function authorizeRoles(...roles) {
  return (req, res, next) => {
    // ✅ ดึง role จากหลาย field เผื่อ JWT ใช้ชื่อไม่ตรง
    const role = req.user?.roleid || req.user?.role || req.user?.role_id;

    if (!role || !roles.includes(role)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = { verifyToken, authorizeRoles };
