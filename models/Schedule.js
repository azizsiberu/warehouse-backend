// path: models/Schedule.js
const pool = require("../config/db");

const Schedule = {
  // Ambil semua jadwal sementara dengan id produk dan nama produk
  async getAllSchedules() {
    const result = await pool.query(`
      SELECT 
        t.id AS transaction_id,
        u.nama_lengkap AS sales_name,
        c.nama_pelanggan,
        t.tanggal_pengiriman,
        CONCAT(c.kabupaten, ' - ', c.provinsi) AS lokasi,
        ARRAY_AGG(p.id_produk) AS product_ids,  -- Array of product IDs
        ARRAY_AGG(p.nama) AS produk_names,  -- Array of product names
        (SELECT status FROM transaction_details td WHERE td.transaction_id = t.id GROUP BY status ORDER BY COUNT(status) DESC LIMIT 1) AS status
      FROM transactions t
      JOIN user_profiles u ON t.user_id = u.id_users
      JOIN customers c ON t.customer_id = c.id
      JOIN transaction_details td ON td.transaction_id = t.id
      JOIN produk p ON p.id_produk = td.id_produk
      GROUP BY t.id, u.nama_lengkap, c.nama_pelanggan, t.tanggal_pengiriman, c.kabupaten, c.provinsi
    `);
    return result.rows;
  },

  // Ambil jadwal sementara berdasarkan ID dengan id produk dan nama produk
  async getScheduleById(id) {
    const result = await pool.query(
      `
        SELECT 
          t.id AS transaction_id,
          u.nama_lengkap AS sales_name,
          c.nama_pelanggan,
          t.tanggal_pengiriman,
          CONCAT(c.kabupaten, ' - ', c.provinsi) AS lokasi,
          ARRAY_AGG(p.id_produk) AS product_ids,  -- Array of product IDs
          ARRAY_AGG(p.nama) AS produk_names,  -- Array of product names
          (SELECT status FROM transaction_details td WHERE td.transaction_id = t.id GROUP BY status ORDER BY COUNT(status) DESC LIMIT 1) AS status
        FROM transactions t
        JOIN user_profiles u ON t.user_id = u.id_users
        JOIN customers c ON t.customer_id = c.id
        JOIN transaction_details td ON td.transaction_id = t.id
        JOIN produk p ON p.id_produk = td.id_produk
        WHERE t.id = $1
        GROUP BY t.id, u.nama_lengkap, c.nama_pelanggan, t.tanggal_pengiriman, c.kabupaten, c.provinsi
      `,
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Schedule;
