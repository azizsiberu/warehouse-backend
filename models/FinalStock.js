// path: models/FinalStock.js
const pool = require("../config/db");

const FinalStock = {
  async findOrCreateStock(stockData, client) {
    const {
      id_produk,
      id_warna,
      id_finishing,
      id_lokasi,
      stok_tersedia,
      is_custom,
      is_raw_material,
      ukuran,
      id_kain,
      id_kaki,
      id_dudukan,
      bantal_peluk,
      bantal_sandaran,
      kantong_remot,
    } = stockData;

    if (!id_produk || !id_lokasi) {
      throw new Error("id_produk dan id_lokasi tidak boleh NULL");
    }

    const query = `
      SELECT * FROM final_stock
      WHERE id_produk = $1 AND id_warna = $2 AND id_finishing = $3 
        AND id_lokasi = $4 AND is_custom = $5 AND is_raw_material = $6
        AND ukuran IS NOT DISTINCT FROM $7
        AND id_kain IS NOT DISTINCT FROM $8
        AND id_kaki IS NOT DISTINCT FROM $9
        AND id_dudukan IS NOT DISTINCT FROM $10
        AND bantal_peluk IS NOT DISTINCT FROM $11
        AND bantal_sandaran IS NOT DISTINCT FROM $12
        AND kantong_remot IS NOT DISTINCT FROM $13
    `;
    const values = [
      id_produk,
      id_warna,
      id_finishing,
      id_lokasi,
      is_custom,
      is_raw_material,
      ukuran,
      id_kain,
      id_kaki,
      id_dudukan,
      bantal_peluk,
      bantal_sandaran,
      kantong_remot,
    ];

    const result = await (client || pool).query(query, values);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    const insertQuery = `
      INSERT INTO final_stock (id_produk, id_warna, id_finishing, id_lokasi, stok_tersedia,
        is_custom, is_raw_material, ukuran, id_kain, id_kaki, id_dudukan, 
        bantal_peluk, bantal_sandaran, kantong_remot)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const insertValues = [
      id_produk,
      id_warna,
      id_finishing,
      id_lokasi,
      stok_tersedia,
      is_custom,
      is_raw_material,
      ukuran,
      id_kain,
      id_kaki,
      id_dudukan,
      bantal_peluk,
      bantal_sandaran,
      kantong_remot,
    ];

    const insertResult = await (client || pool).query(
      insertQuery,
      insertValues
    );
    return insertResult.rows[0];
  },

  async updateStockQuantity(stockId, additionalQuantity, client) {
    const query = `
      UPDATE final_stock
      SET stok_tersedia = stok_tersedia + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const values = [additionalQuantity, stockId];
    const result = await (client || pool).query(query, values);
    return result.rows[0];
  },

  // Method untuk mengurangi stok
  async reduceStockQuantity(stockId, quantityToReduce, client) {
    if (quantityToReduce <= 0) {
      throw new Error("Jumlah pengurangan harus lebih besar dari 0.");
    }

    // Pertama, pastikan stok cukup untuk dikurangi
    const checkQuery = `
    SELECT stok_tersedia FROM final_stock
    WHERE id = $1
  `;
    const checkResult = await (client || pool).query(checkQuery, [stockId]);
    const availableStock = checkResult.rows[0]?.stok_tersedia || 0;

    if (availableStock < quantityToReduce) {
      throw new Error("Stok tidak mencukupi untuk dikurangi.");
    }

    // Jika stok mencukupi, lakukan pengurangan
    const updateQuery = `
    UPDATE final_stock
    SET stok_tersedia = stok_tersedia - $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
    const updateValues = [quantityToReduce, stockId];
    const updateResult = await (client || pool).query(
      updateQuery,
      updateValues
    );
    return updateResult.rows[0];
  },

  // Fungsi untuk mengambil semua stok
  async getAvailableStock({ id_lokasi }) {
    const query = `
    SELECT 
      produk.id_produk, 
      produk.nama, 
      produk.foto_produk,
      kategori.kategori, 
      subkategori.subkategori, 
      vendor.nama_vendor AS vendor
    FROM final_stock
    JOIN produk ON final_stock.id_produk = produk.id_produk
    LEFT JOIN kategori ON produk.id_kategori = kategori.id_kategori
    LEFT JOIN subkategori ON produk.id_subkategori = subkategori.id_subkategori
    LEFT JOIN vendor ON produk.id_vendor = vendor.id_vendor
    WHERE final_stock.id_lokasi = $1
      AND final_stock.stok_tersedia > 0 -- Tambahkan kondisi ini untuk hanya membaca stok tersedia
    GROUP BY produk.id_produk, kategori.kategori, subkategori.subkategori, vendor.nama_vendor
  `;
    const values = [id_lokasi];

    const result = await pool.query(query, values);
    return result.rows;
  },

  async getAllStock() {
    const query = `
      SELECT 
        final_stock.*, 
        produk.nama AS nama, 
        produk.id_kategori, 
        produk.id_subkategori,
        produk.id_vendor, 
        produk.estimasi_waktu_produksi, 
        produk.panjang, 
        produk.lebar, 
        produk.tinggi, 
        produk.foto_produk, 
        produk.masa_garansi, 
        produk.id_jenis, 
        produk.sku AS produk_sku, 
        kategori.kategori, 
        subkategori.subkategori, 
        vendor.nama_vendor AS vendor,
        jenis_produk.jenis_produk,
        kain.kain AS final_kain,
        warna.warna AS final_warna,
        finishing.finishing AS final_finishing,
        kaki.jenis_kaki AS final_kaki,
        dudukan.dudukan AS final_dudukan,
        style.style AS produk_style,
        sofa.id_kain AS sofa_id_kain,
        sofa_kain.kain AS sofa_kain,
        sofa.id_kaki AS sofa_id_kaki,
        sofa_kaki.jenis_kaki AS sofa_kaki,
        sofa.id_dudukan AS sofa_id_dudukan,
        sofa_dudukan.dudukan AS sofa_dudukan,
        sofa.id_style AS sofa_id_style,
        style.style AS sofa_style,
        sofa.bantal_peluk AS sofa_bantal_peluk,
        sofa.bantal_sandaran AS sofa_bantal_sandaran,
        sofa.kantong_remot AS sofa_kantong_remot,
        sofa.puff AS sofa_puff,
        warehouse.lokasi AS warehouse_lokasi
      FROM final_stock
      JOIN produk ON final_stock.id_produk = produk.id_produk
      LEFT JOIN kategori ON produk.id_kategori = kategori.id_kategori
      LEFT JOIN subkategori ON produk.id_subkategori = subkategori.id_subkategori
      LEFT JOIN vendor ON produk.id_vendor = vendor.id_vendor
      LEFT JOIN jenis_produk ON produk.id_jenis = jenis_produk.id_jenis
      LEFT JOIN kain ON final_stock.id_kain = kain.id_kain
      LEFT JOIN warna ON final_stock.id_warna = warna.id_warna
      LEFT JOIN finishing ON final_stock.id_finishing = finishing.id_finishing
      LEFT JOIN kaki ON final_stock.id_kaki = kaki.id_kaki
      LEFT JOIN dudukan ON final_stock.id_dudukan = dudukan.id_dudukan
      LEFT JOIN sofa ON produk.id_produk = sofa.id_produk
      LEFT JOIN kain AS sofa_kain ON sofa.id_kain = sofa_kain.id_kain
      LEFT JOIN kaki AS sofa_kaki ON sofa.id_kaki = sofa_kaki.id_kaki
      LEFT JOIN dudukan AS sofa_dudukan ON sofa.id_dudukan = sofa_dudukan.id_dudukan
      LEFT JOIN style ON sofa.id_style = style.id_style
      LEFT JOIN warehouse ON final_stock.id_lokasi = warehouse.id 
          WHERE final_stock.stok_tersedia > 0 
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getCompleteStockDetails({ id_lokasi, id_produk }) {
    const queryParams = [id_lokasi, id_produk];
    const query = `
    SELECT 
      final_stock.*, 
      produk.nama AS produk_nama, 
      produk.id_kategori, 
      produk.id_subkategori,
      produk.id_vendor, 
      produk.estimasi_waktu_produksi, 
      produk.panjang, 
      produk.lebar, 
      produk.tinggi, 
      produk.foto_produk, 
      produk.masa_garansi, 
      produk.id_jenis, 
      produk.sku AS produk_sku, 
      kategori.kategori, 
      subkategori.subkategori, 
      vendor.nama_vendor AS vendor,
      jenis_produk.jenis_produk,
      warna.warna AS final_warna,
      finishing.finishing AS final_finishing,
      kain.kain AS final_kain,
      kaki.jenis_kaki AS final_kaki,
      dudukan.dudukan AS final_dudukan,
      style.style AS produk_style,
      sofa.id_kain AS sofa_id_kain,
      sofa_kain.kain AS sofa_kain,
      sofa.id_kaki AS sofa_id_kaki,
      sofa_kaki.jenis_kaki AS sofa_kaki,
      sofa.id_dudukan AS sofa_id_dudukan,
      sofa_dudukan.dudukan AS sofa_dudukan,
      sofa.id_style AS sofa_id_style,
      style.style AS sofa_style,
      sofa.bantal_peluk AS sofa_bantal_peluk,
      sofa.bantal_sandaran AS sofa_bantal_sandaran,
      sofa.kantong_remot AS sofa_kantong_remot,
      sofa.puff AS sofa_puff
    FROM final_stock
    JOIN produk ON final_stock.id_produk = produk.id_produk
    LEFT JOIN kategori ON produk.id_kategori = kategori.id_kategori
    LEFT JOIN subkategori ON produk.id_subkategori = subkategori.id_subkategori
    LEFT JOIN vendor ON produk.id_vendor = vendor.id_vendor
    LEFT JOIN jenis_produk ON produk.id_jenis = jenis_produk.id_jenis
    LEFT JOIN warna ON final_stock.id_warna = warna.id_warna
    LEFT JOIN finishing ON final_stock.id_finishing = finishing.id_finishing
    LEFT JOIN kain ON final_stock.id_kain = kain.id_kain
    LEFT JOIN kaki ON final_stock.id_kaki = kaki.id_kaki
    LEFT JOIN dudukan ON final_stock.id_dudukan = dudukan.id_dudukan
    LEFT JOIN sofa ON produk.id_produk = sofa.id_produk
    LEFT JOIN kain AS sofa_kain ON sofa.id_kain = sofa_kain.id_kain
    LEFT JOIN kaki AS sofa_kaki ON sofa.id_kaki = sofa_kaki.id_kaki
    LEFT JOIN dudukan AS sofa_dudukan ON sofa.id_dudukan = sofa_dudukan.id_dudukan
    LEFT JOIN style ON sofa.id_style = style.id_style
    WHERE final_stock.id_lokasi = $1 AND final_stock.id_produk = $2 AND final_stock.stok_tersedia > 0
  `;

    const result = await pool.query(query, queryParams);
    return result.rows;
  },

  async reduceStockQuantity(stockId, quantityToReduce, client) {
    if (quantityToReduce <= 0) {
      throw new Error("Jumlah pengurangan harus lebih besar dari 0.");
    }

    console.log(
      `Reducing stock for final_stock ID ${stockId} by ${quantityToReduce}`
    );

    const checkQuery = `
      SELECT stok_tersedia FROM final_stock WHERE id = $1
    `;
    const checkResult = await (client || pool).query(checkQuery, [stockId]);

    if (checkResult.rows.length === 0) {
      throw new Error(`Final stock dengan ID ${stockId} tidak ditemukan.`);
    }

    const availableStock = checkResult.rows[0].stok_tersedia;
    if (availableStock < quantityToReduce) {
      throw new Error(
        `Stok tidak mencukupi untuk ID ${stockId}. Tersedia: ${availableStock}, Dibutuhkan: ${quantityToReduce}`
      );
    }

    const updateQuery = `
      UPDATE final_stock
      SET stok_tersedia = stok_tersedia - $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING stok_tersedia
    `;
    const updateResult = await (client || pool).query(updateQuery, [
      quantityToReduce,
      stockId,
    ]);

    console.log(
      `Stock reduced successfully. Remaining stock: ${updateResult.rows[0].stok_tersedia}`
    );
    return updateResult.rows[0].stok_tersedia;
  },

  async findById(stockId, client) {
    const query = `
      SELECT id, id_produk, id_warna, id_finishing, id_lokasi, stok_tersedia, is_custom,
             is_raw_material, ukuran, id_kain, id_kaki, id_dudukan, bantal_peluk,
             bantal_sandaran, kantong_remot, created_at, updated_at
      FROM final_stock WHERE id = $1
    `;
    const result = await (client || pool).query(query, [stockId]);

    if (result.rows.length === 0) {
      throw new Error(`Final stock dengan ID ${stockId} tidak ditemukan.`);
    }

    console.log(
      `Final stock details retrieved for ID ${stockId}:`,
      result.rows[0]
    );
    return result.rows[0];
  },

  async upsertStock(stockData, client) {
    const {
      id_produk,
      id_warna,
      id_finishing,
      id_lokasi,
      stok_tersedia,
      is_custom,
      is_raw_material,
      ukuran,
      id_kain,
      id_kaki,
      id_dudukan,
      bantal_peluk,
      bantal_sandaran,
      kantong_remot,
    } = stockData;

    if (!id_produk || !id_lokasi) {
      throw new Error("id_produk dan id_lokasi tidak boleh NULL");
    }

    const query = `
    SELECT id, stok_tersedia FROM final_stock
    WHERE id_produk = $1 AND id_warna IS NOT DISTINCT FROM $2
      AND id_finishing IS NOT DISTINCT FROM $3
      AND id_lokasi = $4 AND is_custom = $5
      AND is_raw_material = $6
      AND ukuran IS NOT DISTINCT FROM $7
      AND id_kain IS NOT DISTINCT FROM $8
      AND id_kaki IS NOT DISTINCT FROM $9
      AND id_dudukan IS NOT DISTINCT FROM $10
      AND bantal_peluk IS NOT DISTINCT FROM $11
      AND bantal_sandaran IS NOT DISTINCT FROM $12
      AND kantong_remot IS NOT DISTINCT FROM $13
  `;
    const values = [
      id_produk,
      id_warna,
      id_finishing,
      id_lokasi,
      is_custom,
      is_raw_material,
      ukuran,
      id_kain,
      id_kaki,
      id_dudukan,
      bantal_peluk,
      bantal_sandaran,
      kantong_remot,
    ];

    // Cari data yang cocok di final_stock
    const result = await (client || pool).query(query, values);

    if (result.rows.length > 0) {
      // Jika ditemukan, update stok_tersedia
      const stockId = result.rows[0].id;
      const newStock = result.rows[0].stok_tersedia + stok_tersedia;

      const updateQuery = `
      UPDATE final_stock
      SET stok_tersedia = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
      const updateValues = [newStock, stockId];
      const updateResult = await (client || pool).query(
        updateQuery,
        updateValues
      );
      return updateResult.rows[0];
    } else {
      // Jika tidak ditemukan, tambahkan baris baru
      const insertQuery = `
      INSERT INTO final_stock (id_produk, id_warna, id_finishing, id_lokasi, stok_tersedia,
        is_custom, is_raw_material, ukuran, id_kain, id_kaki, id_dudukan,
        bantal_peluk, bantal_sandaran, kantong_remot, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
      RETURNING *
    `;
      const insertValues = [
        id_produk,
        id_warna,
        id_finishing,
        id_lokasi,
        stok_tersedia,
        is_custom,
        is_raw_material,
        ukuran,
        id_kain,
        id_kaki,
        id_dudukan,
        bantal_peluk,
        bantal_sandaran,
        kantong_remot,
      ];

      const insertResult = await (client || pool).query(
        insertQuery,
        insertValues
      );
      return insertResult.rows[0];
    }
  },
};

module.exports = FinalStock;
