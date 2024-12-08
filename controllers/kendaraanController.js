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

  // Memperbarui data kendaraan
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nomor_polisi, jenis_kendaraan } = req.body;

      if (!nomor_polisi || !jenis_kendaraan) {
        return res
          .status(400)
          .json({ error: "Nomor Polisi dan Jenis Kendaraan harus diisi" });
      }

      const updatedVehicle = await Kendaraan.updateById(id, {
        nomor_polisi,
        jenis_kendaraan,
      });
      if (!updatedVehicle) {
        return res.status(404).json({ error: "Kendaraan tidak ditemukan" });
      }
      res.status(200).json(updatedVehicle);
    } catch (err) {
      res.status(500).json({ error: "Failed to update kendaraan entry" });
    }
  }

  // Menonaktifkan kendaraan
  static async deactivate(req, res) {
    try {
      const { id } = req.params;

      const deactivatedVehicle = await Kendaraan.deactivateById(id);
      if (!deactivatedVehicle) {
        return res.status(404).json({ error: "Kendaraan tidak ditemukan" });
      }
      res.status(200).json({ message: "Kendaraan berhasil dinonaktifkan" });
    } catch (err) {
      res.status(500).json({ error: "Failed to deactivate kendaraan entry" });
    }
  }
}

module.exports = KendaraanController;
