// path: models/OutgoingStock.js
const pool = require("../config/db");

const OutgoingStock = {
  async addOutgoingStock(data) {
    console.log("addOutgoingStock called with data:", data);

    const { id_final_stock, id_lokasi, id_customer, jumlah, id_user } = data;

    const finalStockQuery = `
      SELECT id_produk, id_warna, id_finishing, is_custom, is_raw_material, ukuran,
             id_kain, id_kaki, id_dudukan, bantal_peluk, bantal_sandaran, kantong_remot
      FROM final_stock
      WHERE id = $1
    `;
    console.log(
      "Executing finalStockQuery with id_final_stock:",
      id_final_stock
    );

    const finalStockResult = await pool.query(finalStockQuery, [
      id_final_stock,
    ]);

    console.log("finalStockQuery result:", finalStockResult.rows);

    if (finalStockResult.rows.length === 0) {
      console.error(
        "Final stock not found for id_final_stock:",
        id_final_stock
      );
      throw new Error("Final stock tidak ditemukan.");
    }

    const finalStockData = finalStockResult.rows[0];

    const insertQuery = `
      INSERT INTO outgoing_stock (
        id_produk, id_warna, id_finishing, id_lokasi, jumlah, is_custom,
        is_raw_material, ukuran, id_kain, id_kaki, id_dudukan, bantal_peluk,
        bantal_sandaran, kantong_remot, id_user, id_lokasi_tujuan, id_customer, created_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
      ) RETURNING *
    `;
    console.log("Executing insertQuery with data:", {
      id_produk: finalStockData.id_produk,
      id_warna: finalStockData.id_warna,
      id_finishing: finalStockData.id_finishing,
      id_lokasi,
      jumlah,
      is_custom: finalStockData.is_custom,
      is_raw_material: finalStockData.is_raw_material,
      ukuran: finalStockData.ukuran,
      id_kain: finalStockData.id_kain,
      id_kaki: finalStockData.id_kaki,
      id_dudukan: finalStockData.id_dudukan,
      bantal_peluk: finalStockData.bantal_peluk,
      bantal_sandaran: finalStockData.bantal_sandaran,
      kantong_remot: finalStockData.kantong_remot,
      id_user,
      id_customer: id_customer ? id_customer : null,
    });

    const result = await pool.query(insertQuery, [
      finalStockData.id_produk,
      finalStockData.id_warna,
      finalStockData.id_finishing,
      id_lokasi,
      jumlah,
      finalStockData.is_custom,
      finalStockData.is_raw_material,
      finalStockData.ukuran,
      finalStockData.id_kain,
      finalStockData.id_kaki,
      finalStockData.id_dudukan,
      finalStockData.bantal_peluk,
      finalStockData.bantal_sandaran,
      finalStockData.kantong_remot,
      id_user,
      id_customer ? null : id_lokasi, // Jika customer, lokasi tujuan null
      id_customer,
    ]);

    console.log("insertQuery result:", result.rows);

    return result.rows[0];
  },
};

module.exports = OutgoingStock;
