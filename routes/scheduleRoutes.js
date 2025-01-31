// path: routes/scheduleRoutes.js
const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

// GET semua jadwal sementara
router.get("/", scheduleController.getAll);
// NEW: GET stok berdasarkan ID (menggunakan findById dari FinalStock)
router.get("/stock/:id", scheduleController.findStockById);

// GET jadwal sementara berdasarkan ID
router.get("/:id", scheduleController.getScheduleDetails);

module.exports = router;
