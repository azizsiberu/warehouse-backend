// path: routes/incomingStockRoutes.js
const express = require("express");
const router = express.Router();
const incomingStockController = require("../controllers/incomingStockController");

// Route untuk menambahkan stok masuk
router.post("/", incomingStockController.addIncomingStock);

module.exports = router;
