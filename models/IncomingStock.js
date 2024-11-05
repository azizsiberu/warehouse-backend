// path: models/IncomingStock.js
const pool = require("../config/db");

// Fungsi untuk menambahkan data ke tabel incoming_stock
const addIncomingStock = async (data) => {
  const {
    id_produk,
    id_warna,
    id_finishing,
    is_custom,
    is_raw_material,
    jumlah,
    id_user,
    id_lokasi,
  } = data;

  const query = `
    INSERT INTO incoming_stock (id_produk, id_warna, id_finishing, is_custom, is_raw_material, jumlah, id_user, id_lokasi, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
    RETURNING id;
  `;
  const values = [
    id_produk,
    id_warna,
    id_finishing,
    is_custom,
    is_raw_material,
    jumlah,
    id_user,
    id_lokasi,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0].id; // Mengembalikan ID dari stok masuk yang baru ditambahkan
};

// Fungsi untuk menambahkan data custom ke tabel stock_custom
const addStockCustom = async (incoming_stock_id, additionalOptions) => {
  const queries = additionalOptions.map((option) => {
    const query = `
      INSERT INTO stock_custom (incoming_stock_id, ukuran, id_kain, id_kaki, id_dudukan, bantal_peluk, bantal_sandaran, kantong_remot)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [
      incoming_stock_id,
      option.ukuran || null,
      option.id_kain || null,
      option.id_kaki || null,
      option.id_dudukan || null,
      option.bantal_peluk || null,
      option.bantal_sandaran || null,
      option.kantong_remot || null,
    ];
    return pool.query(query, values);
  });

  await Promise.all(queries); // Jalankan semua query secara paralel
};

module.exports = {
  addIncomingStock,
  addStockCustom,
};
