const express = require("express");
const router = express.Router();
const VehiclesController = require("../controllers/VehiclesController");
const { verifyToken, authorizeRoles } = require("../middleware/authenticateUser");

// Admin เท่านั้น
router.get("/", verifyToken, authorizeRoles("r1"), VehiclesController.getAll);

// User เท่านั้น → ต้องวางไว้ก่อน /:id
router.get("/mine", verifyToken, authorizeRoles("r2"), VehiclesController.getMine);

// Admin + User
router.get("/:id", verifyToken, authorizeRoles("r1", "r2"), VehiclesController.getById);

// User → เพิ่มรถ
router.post("/", verifyToken, authorizeRoles("r2"), VehiclesController.create);

// Admin + User → อัปเดต
router.put("/:id", verifyToken, authorizeRoles("r1", "r2"), VehiclesController.update);


// Admin + User → ลบ
router.delete("/:id", verifyToken, authorizeRoles("r1", "r2"), VehiclesController.delete);
;

module.exports = router;
