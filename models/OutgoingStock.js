// path: models/OutgoingStock.js
const pool = require("../config/db");

const OutgoingStock = {
  async addOutgoingStock(data, client) {
    console.log("Adding outgoing stock:", data);

    const {
      id_produk,
      id_warna,
      id_finishing,
      id_lokasi,
      jumlah,
      is_custom,
      is_raw_material,
      ukuran,
      id_kain,
      id_kaki,
      id_dudukan,
      bantal_peluk,
      bantal_sandaran,
      kantong_remot,
      id_user,
      id_customer,
      id_kurir,
      id_kendaraan,
      id_ekspedisi,
    } = data;

    const query = `
      INSERT INTO outgoing_stock (
        id_produk, id_warna, id_finishing, id_lokasi, jumlah, is_custom,
        is_raw_material, ukuran, id_kain, id_kaki, id_dudukan, bantal_peluk,
        bantal_sandaran, kantong_remot, id_user, id_customer, id_kurir, id_kendaraan, id_ekspedisi, created_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()
      ) RETURNING id
    `;
    const values = [
      id_produk,
      id_warna,
      id_finishing,
      id_lokasi,
      jumlah,
      is_custom,
      is_raw_material,
      ukuran,
      id_kain,
      id_kaki,
      id_dudukan,
      bantal_peluk,
      bantal_sandaran,
      kantong_remot,
      id_user,
      id_customer,
      id_kurir,
      id_kendaraan,
      id_ekspedisi,
    ];

    const result = await (client || pool).query(query, values);

    if (result.rows.length === 0) {
      throw new Error("Gagal menyimpan data ke outgoing_stock.");
    }

    console.log("Outgoing stock added successfully:", result.rows[0]);
    return result.rows[0];
  },

  async addOutgoingPartner(outgoingStockId, partnerId, client) {
    console.log(
      `Adding partner with ID ${partnerId} for outgoing_stock ID ${outgoingStockId}`
    );

    const query = `
      INSERT INTO outgoing_stock_partners (id_outgoing_stock, id_partner, created_at)
      VALUES ($1, $2, NOW())
    `;

    await (client || pool).query(query, [outgoingStockId, partnerId]);
    console.log(
      `Partner added successfully for outgoing_stock ID ${outgoingStockId}`
    );
  },
};

module.exports = OutgoingStock;
