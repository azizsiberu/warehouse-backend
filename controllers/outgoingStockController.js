//path: controllers/outgoingStockController.js

const OutgoingStock = require("../models/OutgoingStock");
const pool = require("../config/db");

const outgoingStockController = {
  async createOutgoingStock(req, res) {
    const client = await pool.connect();

    try {
      const { id_final_stock, id_lokasi, id_customer, jumlah, id_user } =
        req.body;

      // Debug data request
      console.log("Incoming Request Data:", {
        id_final_stock,
        id_lokasi,
        id_customer,
        jumlah,
        id_user,
      });

      // Validasi data request
      if (!id_user) {
        console.error("Validation Error: Missing id_user.");
        throw new Error("ID user tidak ditemukan. Harap login ulang.");
      }

      if (
        !id_final_stock ||
        !jumlah ||
        jumlah <= 0 ||
        (!id_lokasi && !id_customer)
      ) {
        console.error("Validation Error: Invalid shipping data.");
        throw new Error("Data pengiriman tidak valid.");
      }

      await client.query("BEGIN");

      // Log sebelum validasi stok
      console.log("Validating stock for id_final_stock:", id_final_stock);

      const updateStockQuery = `
        UPDATE final_stock
        SET stok_tersedia = stok_tersedia - $1
        WHERE id = $2 AND stok_tersedia >= $1
        RETURNING stok_tersedia
      `;
      const updateStockResult = await client.query(updateStockQuery, [
        jumlah,
        id_final_stock,
      ]);

      // Debug hasil update stok
      console.log("Update Stock Result:", updateStockResult.rows);

      if (updateStockResult.rows.length === 0) {
        console.error("Stock Error: Insufficient stock or not found.");
        throw new Error(
          "Stok tidak mencukupi atau final stock tidak ditemukan."
        );
      }

      // Log sebelum menambahkan data ke outgoing_stock
      console.log("Preparing to insert outgoing stock data.");
      const outgoingData = {
        id_final_stock,
        id_lokasi,
        id_customer,
        jumlah,
        id_user,
      };

      const newOutgoingStock = await OutgoingStock.addOutgoingStock(
        outgoingData
      );

      // Debug data outgoing_stock yang berhasil ditambahkan
      console.log("New Outgoing Stock Added:", newOutgoingStock);

      await client.query("COMMIT"); // Commit transaksi
      res.status(201).json({
        message: "Pengiriman berhasil diproses.",
        data: newOutgoingStock,
      });
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback jika ada error
      console.error("Error processing outgoing stock:", error.message);
      res.status(500).json({
        message: "Terjadi kesalahan saat memproses pengiriman.",
        error: error.message,
      });
    } finally {
      client.release();
    }
  },
};

module.exports = outgoingStockController;
