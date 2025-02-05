// path: /controllers/incomingStockController.js
const IncomingStock = require("../models/IncomingStock");
const FinalStock = require("../models/FinalStock");
const pool = require("../config/db");

const addIncomingStock = async (req, res) => {
  const products = req.body;

  console.log("Received request to add incoming stock. Products:", products);

  // Validasi payload utama
  if (!Array.isArray(products) || products.length === 0) {
    console.error("Invalid or empty product data.");
    return res
      .status(400)
      .json({ message: "Data produk tidak valid atau kosong." });
  }

  // Validasi setiap produk
  const invalidProduct = products.some(
    (product) =>
      !product.id_produk ||
      typeof product.jumlah !== "number" ||
      !product.id_lokasi ||
      !product.id_user
  );
  if (invalidProduct) {
    console.error("Invalid product detected in payload:", products);
    return res.status(400).json({
      message:
        "Setiap produk harus memiliki id_produk, jumlah (number), id_lokasi, dan id_user.",
    });
  }

  const client = await pool.connect();

  try {
    console.log("Starting transaction...");
    await client.query("BEGIN"); // Memulai transaksi

    // 1. Tambahkan Incoming Stock
    console.log("Inserting into incoming_stock...");
    const productsWithIds = await IncomingStock.addIncomingStock(
      products,
      client
    );
    console.log(
      "Inserted products into incoming_stock. Result:",
      productsWithIds
    );
    console.log("Products with IDs from incoming_stock:", productsWithIds);

    // 2. Update atau Tambahkan ke Final Stock untuk setiap produk
    for (const product of productsWithIds) {
      const stockData = {
        id_produk: product.id_produk,
        id_warna: product.id_warna || null,
        id_finishing: product.id_finishing || null,
        id_lokasi: product.id_lokasi,
        stok_tersedia: product.jumlah,
        is_custom: product.is_custom || false,
        is_raw_material: product.is_raw_material || false,
        ukuran: product.ukuran || null,
        id_kain: product.id_kain || null,
        id_kaki: product.id_kaki || null,
        id_dudukan: product.id_dudukan || null,
        bantal_peluk: product.bantal_peluk || null,
        bantal_sandaran: product.bantal_sandaran || null,
        kantong_remot: product.kantong_remot || null,
        is_complete:
          product.isComplete === "Ya"
            ? true
            : product.isComplete === "Tidak"
            ? false
            : false,
        incomplete_detail: product.incompleteDetail || null,
        product_status: product.productStatus || null,
        detail: product.detail || null,
      };

      console.log(
        "Updating or inserting into final_stock with data:",
        stockData
      );

      await FinalStock.upsertStock(stockData, client);

      console.log(
        "Successfully updated or inserted into final_stock for product:",
        product.id_produk
      );
    }

    console.log("Committing transaction...");
    await client.query("COMMIT"); // Commit transaksi jika semua berhasil

    res.status(201).json({
      message: "Stok masuk dan final stock berhasil diperbarui.",
      incomingStockIds: productsWithIds.map(
        (product) => product.incoming_stock_id
      ),
    });
  } catch (error) {
    console.error("Error occurred during transaction:", error.message);
    await client.query("ROLLBACK"); // Rollback transaksi jika terjadi kesalahan
    res.status(500).json({
      message: "Gagal memperbarui final stock.",
      error: error.message,
    });
  } finally {
    client.release(); // Pastikan client dikembalikan ke pool
    console.log("Database connection released.");
  }
};

module.exports = {
  addIncomingStock,
};
