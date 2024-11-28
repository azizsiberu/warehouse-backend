// path: models/TeamGudang.js
const pool = require("../config/db");

class TeamGudang {
  // Mendapatkan semua data dari tabel team_gudang
  static async getAll() {
    try {
      const query = "SELECT * FROM team_gudang WHERE is_active = true";
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error retrieving team_gudang data:", error);
      throw new Error("Failed to retrieve team_gudang data");
    }
  }

  // Menambahkan data ke tabel team_gudang
  static async create({ nama, jabatan, is_active }) {
    try {
      const query = `
        INSERT INTO team_gudang (nama, jabatan, is_active)
        VALUES ($1, $2, $3)
        RETURNING *`;
      const values = [nama, jabatan, is_active];
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Error inserting into team_gudang:", error);
      throw new Error("Failed to create team_gudang entry");
    }
  }
  static async processTeamMember({ id, nama }, jabatan = null, client) {
    if (id) {
      const query = `
      SELECT id FROM team_gudang WHERE id = $1 AND is_active = true
    `;
      const { rows } = await client.query(query, [id]);
      if (rows.length === 0) throw new Error("Team member tidak valid.");
      return id;
    } else {
      const query = `
      INSERT INTO team_gudang (nama, jabatan, is_active)
      VALUES ($1, $2, true)
      RETURNING id
    `;
      const { rows } = await client.query(query, [nama, jabatan]);
      return rows[0].id;
    }
  }
}

module.exports = TeamGudang;
