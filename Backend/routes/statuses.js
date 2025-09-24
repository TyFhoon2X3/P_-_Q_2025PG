const express = require("express");
const router = express.Router();
const { statusesController } = require("../controllers/statusesController");


router.get("/", statusesController.getStatuses);

router.get("/:id", statusesController.getById);

module.exports = router;