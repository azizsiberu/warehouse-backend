// path: controllers/ekspedisiRekananController.js
const EkspedisiRekanan = require("../models/EkspedisiRekanan");

class EkspedisiRekananController {
  // Mendapatkan semua data dari tabel ekspedisi_rekanan
  static async getAll(req, res) {
    try {
      console.log(
        "[EkspedisiRekananController] Fetching all ekspedisi data..."
      );
      const ekspedisi = await EkspedisiRekanan.getAll();
      console.log("[EkspedisiRekananController] Data fetched:", ekspedisi);
      res.json(ekspedisi);
    } catch (err) {
      console.error("[EkspedisiRekananController] Error fetching data:", err);
      res
        .status(500)
        .json({ error: "Failed to retrieve ekspedisi_rekanan data" });
    }
  }

  // Menambahkan data ke tabel ekspedisi_rekanan
  static async create(req, res) {
    try {
      const { nama_ekspedisi, nama_pic, nomor_hp, is_active } = req.body;

      console.log(
        "[EkspedisiRekananController] Creating new ekspedisi:",
        req.body
      );

      if (
        !nama_ekspedisi ||
        !nama_pic ||
        !nomor_hp ||
        is_active === undefined
      ) {
        console.error(
          "[EkspedisiRekananController] Validation failed:",
          req.body
        );
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

      console.log(
        "[EkspedisiRekananController] New ekspedisi created:",
        newEkspedisi
      );
      res.status(201).json(newEkspedisi);
    } catch (err) {
      console.error(
        "[EkspedisiRekananController] Error creating ekspedisi:",
        err
      );
      res
        .status(500)
        .json({ error: "Failed to create ekspedisi_rekanan entry" });
    }
  }

  // Memperbarui data ekspedisi rekanan
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nama_ekspedisi, nama_pic, nomor_hp } = req.body;

      console.log(
        "[EkspedisiRekananController] Updating ekspedisi:",
        id,
        req.body
      );

      if (!nama_ekspedisi || !nama_pic || !nomor_hp) {
        console.error(
          "[EkspedisiRekananController] Validation failed:",
          req.body
        );
        return res.status(400).json({
          error: "Nama Ekspedisi, Nama PIC, dan Nomor HP harus diisi",
        });
      }

      const updatedEkspedisi = await EkspedisiRekanan.updateById(id, {
        nama_ekspedisi,
        nama_pic,
        nomor_hp,
      });

      if (!updatedEkspedisi) {
        console.error("[EkspedisiRekananController] Ekspedisi not found:", id);
        return res
          .status(404)
          .json({ error: "Ekspedisi Rekanan tidak ditemukan" });
      }

      console.log(
        "[EkspedisiRekananController] Ekspedisi updated:",
        updatedEkspedisi
      );
      res.status(200).json(updatedEkspedisi);
    } catch (err) {
      console.error(
        "[EkspedisiRekananController] Error updating ekspedisi:",
        err
      );
      res
        .status(500)
        .json({ error: "Failed to update ekspedisi_rekanan entry" });
    }
  }

  // Menonaktifkan ekspedisi rekanan
  static async deactivate(req, res) {
    try {
      const { id } = req.params;

      console.log("[EkspedisiRekananController] Deactivating ekspedisi:", id);

      const deactivatedEkspedisi = await EkspedisiRekanan.deactivateById(id);

      if (!deactivatedEkspedisi) {
        console.error("[EkspedisiRekananController] Ekspedisi not found:", id);
        return res
          .status(404)
          .json({ error: "Ekspedisi Rekanan tidak ditemukan" });
      }

      console.log(
        "[EkspedisiRekananController] Ekspedisi deactivated:",
        deactivatedEkspedisi
      );
      res
        .status(200)
        .json({ message: "Ekspedisi Rekanan berhasil dinonaktifkan" });
    } catch (err) {
      console.error(
        "[EkspedisiRekananController] Error deactivating ekspedisi:",
        err
      );
      res
        .status(500)
        .json({ error: "Failed to deactivate ekspedisi_rekanan entry" });
    }
  }
}

module.exports = EkspedisiRekananController;
