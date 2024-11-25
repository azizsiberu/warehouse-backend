// path: routes/ekspedisiRekananRoutes.js
const express = require("express");
const ekspedisiRekananController = require("../controllers/ekspedisiRekananController");

const router = express.Router();

// Route untuk mendapatkan semua data dari tabel ekspedisi_rekanan
router.get("/", ekspedisiRekananController.getAll);

// Route untuk menambahkan data ke tabel ekspedisi_rekanan
router.post("/", ekspedisiRekananController.create);

module.exports = router;
