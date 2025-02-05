// path: routes/outgoingStockRoutes.js
const express = require("express");
const router = express.Router();
const outgoingStockController = require("../controllers/outgoingStockController");

// Endpoint untuk menambahkan data outgoing stock (tanpa pengurangan stok dipesan)
router.post("/", outgoingStockController.createOutgoingStock);

// 🆕 Endpoint untuk menambahkan data outgoing stock dengan pengurangan stok dipesan
router.post(
  "/reserved",
  outgoingStockController.createOutgoingStockWithReservedReduction
);

module.exports = router;
