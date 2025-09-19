const express = require("express");
const router = express.Router();
const { PartsController } = require("../controllers/PartsController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/", PartsController.getParts);
router.get("/:id", PartsController.getById);
router.post("/", PartsController.createPart);
router.put("/:id", PartsController.updatePart);
router.delete("/:id", PartsController.deletePart);

module.exports = router;
