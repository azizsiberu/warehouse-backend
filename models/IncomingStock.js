// path: models/IncomingStock.js
const pool = require("../config/db");

const addIncomingStock = async (products, client) => {
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("Input produk tidak valid atau kosong.");
  }

  console.log(
    "Received products for incoming stock:",
    JSON.stringify(products, null, 2)
  );

  // Validasi setiap produk
  products.forEach((product, index) => {
    if (
      !product.id_produk ||
      typeof product.jumlah !== "number" ||
      !product.id_user ||
      !product.id_lokasi
    ) {
      throw new Error(
        `Produk pada index ${index} tidak valid: ${JSON.stringify(product)}`
      );
    }
  });

  // Membuat query batch insert
  const query = `
    INSERT INTO incoming_stock (
      id_produk, id_warna, id_finishing, is_custom, is_raw_material, jumlah, id_user, id_lokasi,
      ukuran, id_kain, id_kaki, id_dudukan, bantal_peluk, bantal_sandaran, kantong_remot, created_at
    )
    VALUES ${products
      .map(
        (_, i) =>
          `($${i * 15 + 1}, $${i * 15 + 2}, $${i * 15 + 3}, $${i * 15 + 4}, $${
            i * 15 + 5
          }, $${i * 15 + 6}, $${i * 15 + 7}, $${i * 15 + 8}, $${i * 15 + 9}, $${
            i * 15 + 10
          }, $${i * 15 + 11}, $${i * 15 + 12}, $${i * 15 + 13}, $${
            i * 15 + 14
          }, $${i * 15 + 15}, CURRENT_TIMESTAMP)`
      )
      .join(", ")}
    RETURNING id;
  `;

  // Menggabungkan nilai untuk semua produk
  const values = products.flatMap((product) => [
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
  ]);

  try {
    // Eksekusi query
    const result = await (client || pool).query(query, values);

    // Gabungkan hasil dengan data asli
    const ids = result.rows.map((row, index) => ({
      incoming_stock_id: row.id,
      ...products[index],
    }));

    console.log("Inserted incoming stock IDs:", JSON.stringify(ids, null, 2));
    return ids;
  } catch (error) {
    console.error(
      "Error inserting incoming stock:",
      error.message,
      error.stack
    );
    throw error;
  }
};

module.exports = {
  addIncomingStock,
};
