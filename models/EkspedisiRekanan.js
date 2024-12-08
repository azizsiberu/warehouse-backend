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

  // Menonaktifkan ekspedisi rekanan berdasarkan ID (soft delete)
  static async deactivateById(id) {
    const query = `
    UPDATE ekspedisi_rekanan SET is_active = false WHERE id = $1 RETURNING *
  `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  // Memperbarui data ekspedisi rekanan
  static async updateById(id, { nama_ekspedisi, nama_pic, nomor_hp }) {
    const query = `
    UPDATE ekspedisi_rekanan 
    SET nama_ekspedisi = $1, nama_pic = $2, nomor_hp = $3 
    WHERE id = $4 AND is_active = true
    RETURNING *
  `;
    const values = [nama_ekspedisi, nama_pic, nomor_hp, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Mendapatkan jumlah ekspedisi rekanan aktif
  static async countActive() {
    const query =
      "SELECT COUNT(*) as count FROM ekspedisi_rekanan WHERE is_active = true";
    const { rows } = await pool.query(query);
    return parseInt(rows[0].count, 10);
  }

  // Mencari ekspedisi berdasarkan nama PIC
  static async findByPIC(nama_pic) {
    const query = `
    SELECT * FROM ekspedisi_rekanan WHERE nama_pic = $1 AND is_active = true
  `;
    const { rows } = await pool.query(query, [nama_pic]);
    return rows;
  }
}

module.exports = EkspedisiRekanan;
