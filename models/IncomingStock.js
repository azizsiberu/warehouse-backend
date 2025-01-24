const pool = require("../config/db");

const addIncomingStock = async (products, client) => {
  console.log("Starting addIncomingStock...");

  if (!Array.isArray(products) || products.length === 0) {
    console.error("Invalid or empty products array:", products);
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
      console.error(
        `Invalid product at index ${index}:`,
        JSON.stringify(product)
      );
      throw new Error(
        `Produk pada index ${index} tidak valid: ${JSON.stringify(product)}`
      );
    }
  });

  // Membuat query batch insert
  const query = `
  INSERT INTO incoming_stock (
    id_produk, id_warna, id_finishing, is_custom, is_raw_material, jumlah, id_user, id_lokasi,
    ukuran, id_kain, id_kaki, id_dudukan, bantal_peluk, bantal_sandaran, kantong_remot,
    is_complete, incomplete_detail, product_status, detail, created_at
  )
  VALUES ${products
    .map(
      (_, i) =>
        `($${i * 19 + 1}, $${i * 19 + 2}, $${i * 19 + 3}, $${i * 19 + 4}, $${
          i * 19 + 5
        }, $${i * 19 + 6}, 
        $${i * 19 + 7}, $${i * 19 + 8}, $${i * 19 + 9}, $${i * 19 + 10}, $${
          i * 19 + 11
        }, $${i * 19 + 12}, 
        $${i * 19 + 13}, $${i * 19 + 14}, $${i * 19 + 15}, $${i * 19 + 16}, $${
          i * 19 + 17
        }, $${i * 19 + 18}, 
        $${i * 19 + 19}, CURRENT_TIMESTAMP)`
    )
    .join(", ")}
    RETURNING id;

`;

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
    product.isComplete === "Ya"
      ? true
      : product.isComplete === "Tidak"
      ? false
      : product.isComplete || false,
    product.incompleteDetail || null,
    product.productStatus || null,
    product.detail || null,
  ]);

  console.log("Generated INSERT query:", query);
  console.log("With values:", values);

  try {
    // Eksekusi query
    console.log("Executing query...");
    const result = await (client || pool).query(query, values);

    console.log("Query executed successfully. Result:", result.rows);

    // Gabungkan hasil dengan data asli
    const ids = result.rows.map((row, index) => ({
      incoming_stock_id: row.id,
      ...products[index],
    }));

    console.log("Mapped inserted data with IDs:", JSON.stringify(ids, null, 2));
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
