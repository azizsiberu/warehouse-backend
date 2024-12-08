// models/Warehouse.js
const pool = require("../config/db");

const Warehouse = {
  // Mendapatkan semua lokasi gudang
  async getAllWarehouses() {
    const result = await pool.query("SELECT id, lokasi FROM warehouse");
    return result.rows;
  },

  // Menambahkan lokasi gudang baru
  async createWarehouse(lokasi) {
    const query = "INSERT INTO warehouse (lokasi) VALUES ($1) RETURNING *";
    const result = await pool.query(query, [lokasi]);
    return result.rows[0];
  },

  // Memperbarui lokasi gudang berdasarkan ID
  async updateWarehouse(id, lokasi) {
    const query = "UPDATE warehouse SET lokasi = $1 WHERE id = $2 RETURNING *";
    const result = await pool.query(query, [lokasi, id]);
    return result.rows[0];
  },

  // Menghapus lokasi gudang berdasarkan ID
  async deleteWarehouse(id) {
    const query = "DELETE FROM warehouse WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = Warehouse;
