const express = require("express");
const CustomerController = require("../controllers/customerController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ ใช้ JWT middleware กับทุก route
router.get("/", authenticateToken, CustomerController.getCustomers);        
router.get("/:id", authenticateToken, CustomerController.getById);          
router.post("/", authenticateToken, CustomerController.createCustomer);     
router.put("/:id", authenticateToken, CustomerController.updateCustomer);   
router.delete("/:id", authenticateToken, CustomerController.deleteCustomer);
router.put("/:id/ban", authenticateToken, CustomerController.banCustomer);


module.exports = router;
