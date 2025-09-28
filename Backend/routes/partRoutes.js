const express = require("express");
const router = express.Router();
const { PartsController } = require("../controllers/PartsController");
const { verifyToken, authorizeRoles } = require("../middleware/authenticateUser");

// GET all
router.get("/", verifyToken, authorizeRoles("r1"), PartsController.getParts);

// GET by id
router.get("/:id", verifyToken, authorizeRoles("r1"), PartsController.getById);

// CREATE
router.post("/", verifyToken, authorizeRoles("r1"), PartsController.createPart);

// UPDATE
router.put("/:id", verifyToken, authorizeRoles("r1"), PartsController.updatePart);

// DELETE
router.delete("/:id", verifyToken, authorizeRoles("r1"), PartsController.deletePart);

module.exports = router;
