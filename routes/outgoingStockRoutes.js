// path: routes/outgoingStockRoutes.js
const express = require("express");
const router = express.Router();
const outgoingStockController = require("../controllers/outgoingStockController");

// Endpoint untuk menambahkan data outgoing stock
router.post("/", outgoingStockController.createOutgoingStock);

module.exports = router;
