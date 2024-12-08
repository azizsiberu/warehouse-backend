// path: routes/ekspedisiRekananRoutes.js
const express = require("express");
const ekspedisiRekananController = require("../controllers/ekspedisiRekananController");

const router = express.Router();

// Route untuk mendapatkan semua data dari tabel ekspedisi_rekanan
router.get("/", ekspedisiRekananController.getAll);

// Route untuk menambahkan data ke tabel ekspedisi_rekanan
router.post("/", ekspedisiRekananController.create);

// Route untuk memperbarui data ekspedisi rekanan berdasarkan ID
router.put("/:id", ekspedisiRekananController.update);

// Route untuk menonaktifkan data ekspedisi rekanan berdasarkan ID
router.delete("/:id", ekspedisiRekananController.deactivate);

module.exports = router;
