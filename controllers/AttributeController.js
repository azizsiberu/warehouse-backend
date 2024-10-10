const Attribute = require('../models/Attribute');

class AttributeController {
  // Mengambil semua data dari tabel kain
  static async getKain(req, res) {
    try {
      const kain = await Attribute.getKain();
      res.json(kain);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve kain data' });
    }
  }

  // Mengambil semua data dari tabel dudukan
  static async getDudukan(req, res) {
    try {
      const dudukan = await Attribute.getDudukan();
      res.json(dudukan);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve dudukan data' });
    }
  }

  // Mengambil semua data dari tabel kaki
  static async getKaki(req, res) {
    try {
      const kaki = await Attribute.getKaki();
      res.json(kaki);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve kaki data' });
    }
  }

  // Mengambil data dari tabel warna berdasarkan id_kain
  static async getWarnaByKainId(req, res) {
    try {
      const { id_kain } = req.params;
      const warna = await Attribute.getWarnaByKainId(id_kain);
      if (!warna || warna.length === 0) {
        return res.status(404).json({ error: 'No colors found for the given kain id' });
      }
      res.json(warna);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve warna data' });
    }
  }

  // Mengambil semua data dari tabel finishing
  static async getFinishing(req, res) {
    try {
      const finishing = await Attribute.getFinishing();
      res.json(finishing);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve finishing data' });
    }
  }
}

module.exports = AttributeController;
