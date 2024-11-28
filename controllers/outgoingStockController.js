// path: controllers/outgoingStockController.js

const OutgoingStock = require("../models/OutgoingStock");
const pool = require("../config/db");

const outgoingStockController = {
  async createOutgoingStock(req, res) {
    const client = await pool.connect();

    try {
      const payload = req.body;

      console.log("=== Incoming Request: Create Outgoing Stock ===");
      console.log("Incoming Payload:", JSON.stringify(payload, null, 2));

      // Validasi payload
      if (!Array.isArray(payload) || payload.length === 0) {
        console.error(
          "Validation Error: Invalid payload format or empty payload."
        );
        throw new Error("Payload tidak valid.");
      }

      for (const data of payload) {
        if (!data.id_final_stock || !data.jumlah || !data.id_user) {
          console.error(
            "Validation Error: Missing required fields in payload."
          );
          throw new Error("Payload item memiliki properti yang tidak valid.");
        }
      }

      await client.query("BEGIN");

      for (const data of payload) {
        console.log("Processing Payload Item:", data);

        // 1. Kurangi stok final
        console.log("Reducing stock for id_final_stock:", data.id_final_stock);
        const updateStockQuery = `
          UPDATE final_stock
          SET stok_tersedia = stok_tersedia - $1
          WHERE id = $2 AND stok_tersedia >= $1
          RETURNING stok_tersedia
        `;
        const updateStockResult = await client.query(updateStockQuery, [
          data.jumlah,
          data.id_final_stock,
        ]);

        if (updateStockResult.rows.length === 0) {
          console.error(
            `Stock Error: Insufficient stock for ID ${data.id_final_stock}.`
          );
          throw new Error(
            `Stok tidak mencukupi untuk ID ${data.id_final_stock}.`
          );
        }

        console.log(
          "Stock successfully reduced. Remaining stock:",
          updateStockResult.rows[0].stok_tersedia
        );

        // 2. Tambahkan data ke tabel outgoing_stock
        console.log("Inserting data into outgoing_stock...");
        const finalStockQuery = `
          SELECT id_produk, id_warna, id_finishing, is_custom, is_raw_material, ukuran,
                 id_kain, id_kaki, id_dudukan, bantal_peluk, bantal_sandaran, kantong_remot
          FROM final_stock
          WHERE id = $1
        `;
        const finalStockResult = await client.query(finalStockQuery, [
          data.id_final_stock,
        ]);

        if (finalStockResult.rows.length === 0) {
          console.error(
            `Final stock not found for id_final_stock: ${data.id_final_stock}`
          );
          throw new Error("Final stock tidak ditemukan.");
        }

        const finalStockData = finalStockResult.rows[0];

        const outgoingStockQuery = `
          INSERT INTO outgoing_stock (
            id_produk, id_warna, id_finishing, id_lokasi, jumlah, is_custom,
            is_raw_material, ukuran, id_kain, id_kaki, id_dudukan, bantal_peluk,
            bantal_sandaran, kantong_remot, id_user, id_customer, id_kurir, id_kendaraan, id_ekspedisi, created_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()
          ) RETURNING id
        `;
        const outgoingStockResult = await client.query(outgoingStockQuery, [
          finalStockData.id_produk,
          finalStockData.id_warna,
          finalStockData.id_finishing,
          data.id_lokasi,
          data.jumlah,
          finalStockData.is_custom,
          finalStockData.is_raw_material,
          finalStockData.ukuran,
          finalStockData.id_kain,
          finalStockData.id_kaki,
          finalStockData.id_dudukan,
          finalStockData.bantal_peluk,
          finalStockData.bantal_sandaran,
          finalStockData.kantong_remot,
          data.id_user,
          data.id_customer,
          data.id_kurir,
          data.id_kendaraan,
          data.id_ekspedisi,
        ]);

        const outgoingStockId = outgoingStockResult.rows[0].id;
        console.log(
          "Outgoing stock successfully inserted. ID:",
          outgoingStockId
        );

        // 3. Tambahkan data partner jika ada
        if (data.partners && data.partners.length > 0) {
          console.log(
            "Inserting partner data for outgoing stock ID:",
            outgoingStockId
          );
          const partnerQuery = `
            INSERT INTO outgoing_stock_partners (id_outgoing_stock, id_partner, created_at)
            VALUES ($1, $2, NOW())
          `;
          for (const partner of data.partners) {
            if (!partner.id) {
              console.error("Partner ID is missing:", partner);
              throw new Error("Partner harus memiliki ID.");
            }
            console.log("Adding partner with ID:", partner.id);
            await client.query(partnerQuery, [outgoingStockId, partner.id]);
          }
        }
      }

      await client.query("COMMIT");
      console.log("=== Outgoing Stock Process Completed Successfully ===");
      res.status(201).json({ message: "Pengiriman berhasil disimpan." });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in createOutgoingStock:", error.message);
      res
        .status(500)
        .json({ message: "Terjadi kesalahan.", error: error.message });
    } finally {
      client.release();
    }
  },
};

module.exports = outgoingStockController;
