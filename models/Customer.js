//path: models/Customer.js
const pool = require("../config/db");

const Customer = {
  async getAllCustomers() {
    const result = await pool.query("SELECT * FROM customers");
    return result.rows;
  },

  async getCustomerById(id) {
    const result = await pool.query("SELECT * FROM customers WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  },

  async createCustomer({
    nama_pelanggan,
    alamat_pelanggan,
    nomor_hp,
    kelurahan,
    kecamatan,
    kabupaten,
    provinsi,
  }) {
    const result = await pool.query(
      `INSERT INTO customers (nama_pelanggan, alamat_pelanggan, nomor_hp, kelurahan, kecamatan, kabupaten, provinsi)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        nama_pelanggan,
        alamat_pelanggan,
        nomor_hp,
        kelurahan,
        kecamatan,
        kabupaten,
        provinsi,
      ]
    );
    return result.rows[0];
  },

  async updateCustomer(
    id,
    {
      nama_pelanggan,
      alamat_pelanggan,
      nomor_hp,
      kelurahan,
      kecamatan,
      kabupaten,
      provinsi,
    }
  ) {
    const result = await pool.query(
      `UPDATE customers
       SET nama_pelanggan = $1, alamat_pelanggan = $2, nomor_hp = $3, kelurahan = $4, kecamatan = $5, kabupaten = $6, provinsi = $7
       WHERE id = $8
       RETURNING *`,
      [
        nama_pelanggan,
        alamat_pelanggan,
        nomor_hp,
        kelurahan,
        kecamatan,
        kabupaten,
        provinsi,
        id,
      ]
    );
    return result.rows[0];
  },

  async deleteCustomer(id) {
    const result = await pool.query(
      "DELETE FROM customers WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Customer;
