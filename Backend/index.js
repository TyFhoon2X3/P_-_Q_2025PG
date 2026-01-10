// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load .env at the very beginning
dotenv.config();

// Controllers
const { register } = require("./controllers/registerController");
const { login } = require("./controllers/authController");

// Routes
const customerRoutes = require("./routes/customer");
const VehicleRoutes = require("./routes/vehicles");
const roleRoutes = require("./routes/RoleRoutes");
const partRoutes = require("./routes/partRoutes");
const typeRoutes = require("./routes/type");
const brandRoutes = require("./routes/brand");
const profileRoutes = require("./routes/profile");
const bookingRoutes = require("./routes/bookingRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const repairItemRoutes = require("./routes/repairItemRoutes");

const app = express();

// ====================================
// ✅ 1. CORS Configuration
// ====================================
app.use(
  cors({
    origin: "http://localhost:8000", // URL ของ React frontend
    credentials: true,
  })
);

// ====================================
// ✅ 2. Body Parser
// ====================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================================
// ✅ 3. เปิด Static Folder สำหรับ uploads
// ✅ (ต้องอยู่ก่อนการ mount routes ทั้งหมด)
// ====================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====================================
// ✅ 4. Public Routes (ไม่ต้อง JWT)
// ====================================
app.post("/api/login", login);
app.post("/api/register", register);

// ====================================
// ✅ 5. Protected / Private Routes
// ====================================
app.use("/api/customers", customerRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/parts", partRoutes);
app.use("/api/typecar", typeRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/repair-items", repairItemRoutes);
app.use("/api/contact", require("./routes/contactRoutes"));

// ====================================
// ✅ 6. Default Route (404 handler)
// ====================================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ====================================
// ✅ 7. Start Server
// ====================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
