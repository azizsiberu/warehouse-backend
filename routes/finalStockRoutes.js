// path: routes/finalStockRoutes.js
const express = require("express");
const router = express.Router();
const finalStockController = require("../controllers/finalStockController");

router.get("/", finalStockController.getFinalStock);
router.get("/available", finalStockController.getAvailableStock);
router.get("/details", finalStockController.getStockDetails);

module.exports = router;
