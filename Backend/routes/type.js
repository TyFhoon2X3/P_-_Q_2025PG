const express = require("express");
const router = express.Router();
const { type } = require("../controllers/typeccarController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/", type.getTypeCar);

router.get("/:id", type.getById);


router.post("/", type.createTypeCar);


router.put("/:id", type.updateTypeCar);

router.delete("/:id", type.deleteTypeCar);



module.exports = router;
