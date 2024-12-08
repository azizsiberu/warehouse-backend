// path: controllers/incomingStockController.js
const IncomingStock = require("../models/IncomingStock");
const FinalStock = require("../models/FinalStock");
const pool = require("../config/db");

const addIncomingStock = async (req, res) => {
  const products = req.body;

  // Validasi payload utama
  if (!Array.isArray(products) || products.length === 0) {
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
    return res.status(400).json({
      message:
        "Setiap produk harus memiliki id_produk, jumlah (number), id_lokasi, dan id_user.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Memulai transaksi

    // 1. Tambahkan Incoming Stock
    const productsWithIds = await IncomingStock.addIncomingStock(
      products,
      client
    );

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
      };

      // Gunakan upsertStock untuk menambah atau memperbarui stok akhir
      await FinalStock.upsertStock(stockData, client);
    }

    await client.query("COMMIT"); // Commit transaksi jika semua berhasil

    res.status(201).json({
      message: "Stok masuk dan final stock berhasil diperbarui.",
      incomingStockIds: productsWithIds.map(
        (product) => product.incoming_stock_id
      ),
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback transaksi jika terjadi kesalahan
    console.error("Error updating final stock:", error.message);
    res.status(500).json({
      message: "Gagal memperbarui final stock.",
      error: error.message,
    });
  } finally {
    client.release(); // Pastikan client dikembalikan ke pool
  }
};

module.exports = {
  addIncomingStock,
};
