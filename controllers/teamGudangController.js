// path: controllers/teamGudangController.js
const TeamGudang = require("../models/TeamGudang");

class TeamGudangController {
  // Mengambil semua data dari tabel team_gudang
  static async getAll(req, res) {
    try {
      const team = await TeamGudang.getAll();
      res.json(team);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve team_gudang data" });
    }
  }

  // Menambahkan data ke tabel team_gudang
  static async create(req, res) {
    try {
      const { nama, jabatan, is_active } = req.body;

      // Validasi input
      if (!nama || !jabatan || is_active === undefined) {
        return res
          .status(400)
          .json({ error: "Nama, Jabatan, dan Status harus diisi" });
      }

      const newTeam = await TeamGudang.create({ nama, jabatan, is_active });
      res.status(201).json(newTeam);
    } catch (err) {
      res.status(500).json({ error: "Failed to create team_gudang entry" });
    }
  }

  // Memperbarui data tim gudang
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nama, jabatan } = req.body;

      if (!nama || !jabatan) {
        return res.status(400).json({ error: "Nama dan Jabatan harus diisi" });
      }

      const updatedTeam = await TeamGudang.updateById(id, { nama, jabatan });
      if (!updatedTeam) {
        return res.status(404).json({ error: "Team Gudang tidak ditemukan" });
      }
      res.status(200).json(updatedTeam);
    } catch (err) {
      res.status(500).json({ error: "Failed to update team_gudang entry" });
    }
  }

  // Menonaktifkan anggota tim gudang
  static async deactivate(req, res) {
    try {
      const { id } = req.params;

      const deactivatedTeam = await TeamGudang.deactivateById(id);
      if (!deactivatedTeam) {
        return res.status(404).json({ error: "Team Gudang tidak ditemukan" });
      }
      res.status(200).json({ message: "Team Gudang berhasil dinonaktifkan" });
    } catch (err) {
      res.status(500).json({ error: "Failed to deactivate team_gudang entry" });
    }
  }
}

module.exports = TeamGudangController;
