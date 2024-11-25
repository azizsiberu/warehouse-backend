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
}

module.exports = TeamGudangController;
