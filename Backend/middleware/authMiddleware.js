// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  // header ควรเป็น: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token." });
    }
    req.user = user; // เก็บ payload ไว้ใช้งาน เช่น email, role
    next();
  });
}

module.exports = authenticateToken;
