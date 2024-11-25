// path: models/IncomingStock.js
const pool = require("../config/db");

const addIncomingStock = async (products, client) => {
  console.log(
    "Received products for incoming stock:",
    JSON.stringify(products, null, 2)
  );

  const query = `
    INSERT INTO incoming_stock (
      id_produk, id_warna, id_finishing, is_custom, is_raw_material, jumlah, id_user, id_lokasi,
      ukuran, id_kain, id_kaki, id_dudukan, bantal_peluk, bantal_sandaran, kantong_remot, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
    RETURNING id;
  `;

  const results = await Promise.all(
    products.map((product, index) => {
      const values = [
        product.id_produk,
        product.id_warna || null,
        product.id_finishing || null,
        product.is_custom || false,
        product.is_raw_material || false,
        product.jumlah,
        product.id_user,
        product.id_lokasi,
        product.ukuran || null,
        product.id_kain || null,
        product.id_kaki || null,
        product.id_dudukan || null,
        product.bantal_peluk || null,
        product.bantal_sandaran || null,
        product.kantong_remot || null,
      ];

      console.log(
        `Executing query for product #${index + 1} with values:`,
        JSON.stringify(values, null, 2)
      );

      // Gunakan `client` jika disediakan, jika tidak, gunakan `pool`
      return (client || pool).query(query, values);
    })
  );

  const ids = results.map((result, index) => ({
    incoming_stock_id: result.rows[0].id,
    ...products[index], // Menggabungkan data produk asli ke hasil yang dikembalikan
  }));

  console.log("Inserted incoming stock IDs:", JSON.stringify(ids, null, 2));

  return ids;
};

module.exports = {
  addIncomingStock,
};
