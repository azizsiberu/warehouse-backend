// path: controllers/ekspedisiRekananController.js
const EkspedisiRekanan = require("../models/EkspedisiRekanan");

class EkspedisiRekananController {
  // Mendapatkan semua data dari tabel ekspedisi_rekanan
  static async getAll(req, res) {
    try {
      const ekspedisi = await EkspedisiRekanan.getAll();
      res.json(ekspedisi);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to retrieve ekspedisi_rekanan data" });
    }
  }

  // Menambahkan data ke tabel ekspedisi_rekanan
  static async create(req, res) {
    try {
      const { nama_ekspedisi, nama_pic, nomor_hp, is_active } = req.body;

      // Validasi input
      if (
        !nama_ekspedisi ||
        !nama_pic ||
        !nomor_hp ||
        is_active === undefined
      ) {
        return res.status(400).json({
          error: "Nama Ekspedisi, Nama PIC, Nomor HP, dan Status harus diisi",
        });
      }

      const newEkspedisi = await EkspedisiRekanan.create({
        nama_ekspedisi,
        nama_pic,
        nomor_hp,
        is_active,
      });
      res.status(201).json(newEkspedisi);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to create ekspedisi_rekanan entry" });
    }
  }
}

module.exports = EkspedisiRekananController;
