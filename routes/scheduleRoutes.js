// path: routes/scheduleRoutes.js
const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

// GET semua jadwal sementara
router.get("/", scheduleController.getAll);
// GET jadwal sementara berdasarkan ID
router.get("/:id", scheduleController.getScheduleDetails);

module.exports = router;
