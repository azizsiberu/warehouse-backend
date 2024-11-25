// path: models/EkspedisiRekanan.js
const pool = require("../config/db");

class EkspedisiRekanan {
  // Mendapatkan semua data dari tabel ekspedisi_rekanan
  static async getAll() {
    try {
      const query = "SELECT * FROM ekspedisi_rekanan WHERE is_active = true";
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error retrieving ekspedisi_rekanan data:", error);
      throw new Error("Failed to retrieve ekspedisi_rekanan data");
    }
  }

  // Menambahkan data ke tabel ekspedisi_rekanan
  static async create({ nama_ekspedisi, nama_pic, nomor_hp, is_active }) {
    try {
      const query = `
        INSERT INTO ekspedisi_rekanan (nama_ekspedisi, nama_pic, nomor_hp, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING *`;
      const values = [nama_ekspedisi, nama_pic, nomor_hp, is_active];
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Error inserting into ekspedisi_rekanan:", error);
      throw new Error("Failed to create ekspedisi_rekanan entry");
    }
  }
}

module.exports = EkspedisiRekanan;
