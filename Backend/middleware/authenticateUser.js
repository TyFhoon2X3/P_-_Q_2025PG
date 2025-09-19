const jwt = require("jsonwebtoken");

// 🔹 ตรวจสอบ JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // คาดหวัง "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
    req.user = decoded; // เก็บข้อมูล user ไว้ใช้ต่อ
    next();
  });
}

// 🔹 ตรวจสอบ Role (เช่น admin, user)
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.roleid)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = { verifyToken, authorizeRoles };
