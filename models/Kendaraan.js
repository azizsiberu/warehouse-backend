// path: models/Kendaraan.js
const pool = require("../config/db");

class Kendaraan {
  // Mendapatkan semua kendaraan aktif
  static async getAll() {
    const query = "SELECT * FROM kendaraan WHERE is_active = true";
    const { rows } = await pool.query(query);
    return rows;
  }

  // Mendapatkan kendaraan berdasarkan nomor polisi
  static async findByPlate(nomor_polisi) {
    const query = `
      SELECT * FROM kendaraan WHERE nomor_polisi = $1 AND is_active = true
    `;
    const { rows } = await pool.query(query, [nomor_polisi]);
    return rows[0] || null;
  }

  // Menambahkan kendaraan baru
  static async create({ nomor_polisi, jenis_kendaraan }) {
    const query = `
      INSERT INTO kendaraan (nomor_polisi, jenis_kendaraan, is_active)
      VALUES ($1, $2, true)
      RETURNING id
    `;
    const values = [nomor_polisi, jenis_kendaraan];
    const { rows } = await pool.query(query, values);
    if (!rows[0]?.id) {
      throw new Error("Gagal menambahkan kendaraan baru.");
    }
    return rows[0].id;
  }

  // Memproses kendaraan (cari atau tambahkan)
  static async processVehicle({ nomor_polisi, jenis_kendaraan }, client) {
    const existingVehicle = await client.query(
      `
        SELECT id FROM kendaraan WHERE nomor_polisi = $1 AND is_active = true
      `,
      [nomor_polisi]
    );

    if (existingVehicle.rows.length > 0) {
      return existingVehicle.rows[0].id;
    }

    const query = `
      INSERT INTO kendaraan (nomor_polisi, jenis_kendaraan, is_active)
      VALUES ($1, $2, true)
      RETURNING id
    `;
    const { rows } = await client.query(query, [nomor_polisi, jenis_kendaraan]);
    if (!rows[0]?.id) {
      throw new Error("Gagal menambahkan kendaraan baru.");
    }
    return rows[0].id;
  }
}

module.exports = Kendaraan;
