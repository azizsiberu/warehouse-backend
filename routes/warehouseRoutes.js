// routes/warehouseRoutes.js
const express = require("express");
const router = express.Router();
const warehouseController = require("../controllers/warehouseController");

// Route untuk mendapatkan data warehouse
router.get("/", warehouseController.getAllWarehouses);

module.exports = router;
