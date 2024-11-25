const pool = require("../config/db");

class Kendaraan {
  // Mendapatkan semua kendaraan aktif
  static async getAll() {
    const query = "SELECT * FROM kendaraan WHERE is_active = true";
    const { rows } = await pool.query(query);
    return rows;
  }

  // Menambahkan kendaraan baru
  static async create({ nomor_polisi, jenis_kendaraan }) {
    const query = `
      INSERT INTO kendaraan (nomor_polisi, jenis_kendaraan)
      VALUES ($1, $2)
      RETURNING *`;
    const values = [nomor_polisi, jenis_kendaraan];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

module.exports = Kendaraan;
