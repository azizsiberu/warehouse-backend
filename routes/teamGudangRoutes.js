// path: routes/teamGudangRoutes.js
const express = require("express");
const teamGudangController = require("../controllers/teamGudangController");

const router = express.Router();

// Route untuk mendapatkan semua data dari tabel team_gudang
router.get("/", teamGudangController.getAll);

// Route untuk menambahkan data ke tabel team_gudang
router.post("/", teamGudangController.create);

module.exports = router;
