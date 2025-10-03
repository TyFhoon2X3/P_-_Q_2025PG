// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

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

// ...

// Load .env
dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:8000", // ปรับตาม frontend ของคุณ
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// ===== Public routes =====
app.post("/api/login", login);
app.post("/api/register", register);

// ===== Protected routes (ภายหลังใส่ JWT middleware ได้) =====
app.use("/api/customers", customerRoutes);

// ===== Other route mounts =====
app.use("/api/roles", roleRoutes);
app.use("/api/parts", partRoutes);
app.use("/api/typecar", typeRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Optional: route not found handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
