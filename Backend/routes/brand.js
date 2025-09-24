// routes/brandRoutes.js
const express = require("express");
const router = express.Router();
const { Brand } = require("../controllers/Brandcontroller");
const authenticateToken = require("../middleware/authMiddleware");

// GET all brands
router.get("/",authenticateToken,Brand.getBrand);

// GET brand by ID
router.get("/:id",authenticateToken, Brand.getById);

// CREATE brand
router.post("/",authenticateToken, Brand.createBrand);

// UPDATE brand
router.put("/:id",authenticateToken, Brand.updateBrand);

// DELETE brand
router.delete("/:id",authenticateToken, Brand.deleteBrand);

module.exports = router;
