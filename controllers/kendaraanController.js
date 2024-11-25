const Kendaraan = require("../models/Kendaraan");

class KendaraanController {
  // Mendapatkan semua kendaraan
  static async getAll(req, res) {
    try {
      const kendaraan = await Kendaraan.getAll();
      res.json(kendaraan);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve kendaraan" });
    }
  }

  // Menambahkan kendaraan baru
  static async create(req, res) {
    try {
      const { nomor_polisi, jenis_kendaraan } = req.body;

      if (!nomor_polisi || !jenis_kendaraan) {
        return res
          .status(400)
          .json({ error: "Nomor polisi dan jenis kendaraan harus diisi" });
      }

      const newKendaraan = await Kendaraan.create({
        nomor_polisi,
        jenis_kendaraan,
      });
      res.status(201).json(newKendaraan);
    } catch (err) {
      res.status(500).json({ error: "Failed to create kendaraan" });
    }
  }
}

module.exports = KendaraanController;
