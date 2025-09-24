const express = require("express");
const router = express.Router();
const { RoleController } = require("../controllers/RoleController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);


router.get("/", RoleController.GetRole);
router.get("/:id", RoleController.GetRoleById);
module.exports = router;