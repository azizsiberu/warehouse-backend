// path: routes/scheduleRoutes.js
const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

// GET semua jadwal sementara
router.get("/", scheduleController.getAll);

// 🔹 Simpan jadwal pengiriman final
router.post("/final", scheduleController.createFinalSchedule);

// 🔹 Ambil semua jadwal pengiriman final
router.get("/final", scheduleController.getAllFinalSchedules);

// 🔹 Finalisasi pengiriman
router.post("/finalize/:id_schedule", scheduleController.finalizeSchedule);

// 🔹 Ambil detail jadwal berdasarkan ID
router.get("/final/:id_schedule", scheduleController.getFinalScheduleById);

// NEW: GET stok berdasarkan ID (menggunakan findById dari FinalStock)
router.get("/stock/:id", scheduleController.findStockById);

// GET jadwal sementara berdasarkan ID
router.get("/:id", scheduleController.getScheduleDetails);

module.exports = router;
