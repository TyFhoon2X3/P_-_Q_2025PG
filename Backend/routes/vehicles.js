// routes/vehicles.js
const express = require('express');
const router = express.Router();
const VehiclesController = require('../controllers/VehiclesController');
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.post('/', VehiclesController.create);
router.get('/', VehiclesController.getAll);
router.get('/:id', VehiclesController.getById);
router.put('/:id', VehiclesController.update);
router.delete('/:id', VehiclesController.delete);



module.exports = router;