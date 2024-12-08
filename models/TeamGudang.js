// path: models/TeamGudang.js
const pool = require("../config/db");

class TeamGudang {
  // Mendapatkan semua data dari tabel team_gudang
  static async getAll() {
    const query = "SELECT * FROM team_gudang WHERE is_active = true";
    const { rows } = await pool.query(query);
    return rows;
  }

  // Mendapatkan data berdasarkan ID
  static async findById(id) {
    const query = `
      SELECT * FROM team_gudang WHERE id = $1 AND is_active = true
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Mendapatkan data berdasarkan nama
  static async findByName(nama) {
    const query = `
      SELECT * FROM team_gudang WHERE nama = $1 AND is_active = true
    `;
    const { rows } = await pool.query(query, [nama]);
    return rows[0] || null;
  }

  // Menambahkan data ke tabel team_gudang
  static async create({ nama, jabatan, is_active }) {
    const query = `
      INSERT INTO team_gudang (nama, jabatan, is_active)
      VALUES ($1, $2, $3)
      RETURNING *`;
    const values = [nama, jabatan, is_active];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Memproses driver atau partner
  static async processTeamMember({ id, nama }, jabatan = null, client) {
    if (!id) {
      console.log(`Adding new driver: ${nama}, Jabatan: ${jabatan}`);
      const query = `
    INSERT INTO team_gudang (nama, jabatan, is_active)
    VALUES ($1, $2, true)
    RETURNING id
  `;
      const { rows } = await client.query(query, [nama, jabatan]);
      if (!rows[0]?.id) {
        console.error("Failed to insert new driver.");
        throw new Error("Gagal menambahkan driver baru.");
      }
      console.log(`New driver added with ID: ${rows[0].id}`);
      return rows[0].id;
    }
  }

  // Menonaktifkan anggota tim gudang berdasarkan ID (soft delete)
  static async deactivateById(id) {
    const query = `
    UPDATE team_gudang SET is_active = false WHERE id = $1 RETURNING *
  `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  // Memperbarui data anggota tim gudang
  static async updateById(id, { nama, jabatan }) {
    const query = `
    UPDATE team_gudang 
    SET nama = $1, jabatan = $2 
    WHERE id = $3 AND is_active = true
    RETURNING *
  `;
    const values = [nama, jabatan, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Mendapatkan jumlah anggota tim gudang aktif
  static async countActive() {
    const query =
      "SELECT COUNT(*) as count FROM team_gudang WHERE is_active = true";
    const { rows } = await pool.query(query);
    return parseInt(rows[0].count, 10);
  }

  // Memastikan nama anggota tim gudang unik
  static async isNameUnique(nama) {
    const query = `
    SELECT COUNT(*) as count FROM team_gudang WHERE nama = $1 AND is_active = true
  `;
    const { rows } = await pool.query(query, [nama]);
    return parseInt(rows[0].count, 10) === 0;
  }
}

module.exports = TeamGudang;
