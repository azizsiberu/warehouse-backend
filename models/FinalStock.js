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
    console.log(
      `🔻 [reduceStockQuantity] Mengurangi stok untuk final_stock ID ${stockId} sebanyak ${quantityToReduce}`
    );

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

    console.log(
      `✅ [reduceStockQuantity] Stok berhasil dikurangi. Sisa stok: ${updateResult.rows[0].stok_tersedia}`
    );
    return updateResult.rows[0];
  },

  // 🆕 Fungsi untuk mengurangi stok yang dipesan (stok_dipesan)
  async reduceReservedStock(stockId, quantityToReduce, client) {
    if (quantityToReduce <= 0) {
      throw new Error("Jumlah pengurangan harus lebih besar dari 0.");
    }

    console.log(
      `🔻 [reduceReservedStock] Mengurangi stok dipesan untuk final_stock ID ${stockId} sebanyak ${quantityToReduce}`
    );

    // Pastikan stok_dipesan cukup sebelum dikurangi
    const checkQuery = `SELECT stok_dipesan FROM final_stock WHERE id = $1`;
    const checkResult = await (client || pool).query(checkQuery, [stockId]);

    if (checkResult.rows.length === 0) {
      throw new Error(`❌ Final stock dengan ID ${stockId} tidak ditemukan.`);
    }

    const reservedStock = checkResult.rows[0].stok_dipesan;
    if (reservedStock < quantityToReduce) {
      throw new Error(
        `❌ Stok dipesan tidak mencukupi. Dipesan: ${reservedStock}, Dikurangi: ${quantityToReduce}`
      );
    }

    // Lakukan update stok_dipesan
    const updateQuery = `
      UPDATE final_stock
      SET stok_dipesan = stok_dipesan - $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING stok_dipesan
    `;
    const updateValues = [quantityToReduce, stockId];

    const updateResult = await (client || pool).query(
      updateQuery,
      updateValues
    );

    console.log(
      `✅ [reduceReservedStock] Stok dipesan berhasil dikurangi. Sisa stok_dipesan: ${updateResult.rows[0].stok_dipesan}`
    );

    return updateResult.rows[0].stok_dipesan;
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
      SELECT 
        fs.id, 
        fs.id_produk, 
        fs.id_warna, 
        fs.id_finishing, 
        fs.id_lokasi, 
        fs.stok_tersedia, 
        fs.is_custom,
        fs.is_raw_material, 
        fs.ukuran, 
        fs.id_kain, 
        fs.id_kaki, 
        fs.id_dudukan, 
        fs.bantal_peluk,
        fs.bantal_sandaran, 
        fs.kantong_remot, 
        fs.created_at, 
        fs.updated_at,
        p.nama AS nama_produk, 
        p.foto_produk, 
        w.warna, 
        f.finishing, 
        wh.lokasi AS lokasi
      FROM 
        final_stock fs
      LEFT JOIN 
        produk p ON fs.id_produk = p.id_produk
      LEFT JOIN 
        warna w ON fs.id_warna = w.id_warna
      LEFT JOIN 
        finishing f ON fs.id_finishing = f.id_finishing
      LEFT JOIN 
        warehouse wh ON fs.id_lokasi = wh.id
      WHERE 
        fs.id = $1
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
      is_complete,
      incomplete_detail,
      product_status,
      detail,
    } = stockData;

    console.log("Starting upsertStock with data:", stockData);

    if (!id_produk || !id_lokasi) {
      throw new Error("id_produk dan id_lokasi tidak boleh NULL");
    }

    const query = `
    SELECT id, stok_tersedia, stok_dipesan FROM final_stock
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
      AND is_complete IS NOT DISTINCT FROM $14
      AND incomplete_detail IS NOT DISTINCT FROM $15
      AND product_status IS NOT DISTINCT FROM $16
      AND detail IS NOT DISTINCT FROM $17
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
      is_complete,
      incomplete_detail,
      product_status,
      detail,
    ];

    console.log("Running SELECT query:", query);
    console.log("With values:", values);

    const result = await (client || pool).query(query, values);

    console.log("SELECT query result:", result.rows);

    // 🆕 Menentukan apakah stok_dipesan harus ditambahkan
    const isReserved = product_status === "Sudah Dipesan";
    console.log(`Is product reserved (Sudah Dipesan)? ${isReserved}`);

    if (result.rows.length > 0) {
      // Jika ditemukan, update stok_tersedia
      const stockId = result.rows[0].id;
      const newStock = result.rows[0].stok_tersedia + stok_tersedia;
      const newReservedStock = isReserved
        ? result.rows[0].stok_dipesan + stok_tersedia
        : result.rows[0].stok_dipesan; // Jika status bukan "Sudah Dipesan", stok_dipesan tidak berubah

      console.log(
        `Updating stock ID: ${stockId} | New stok_tersedia: ${newStock} | New stok_dipesan: ${newReservedStock}`
      );

      const updateQuery = `
      UPDATE final_stock
      SET stok_tersedia = $1,
          stok_dipesan = $2,
          updated_at = CURRENT_TIMESTAMP,
          is_complete = $3::BOOLEAN,
          incomplete_detail = $4::TEXT,
          product_status = $5::TEXT,
          detail = $6::TEXT
      WHERE id = $7
      RETURNING *;
      `;

      const updateValues = [
        newStock,
        newReservedStock,
        is_complete,
        incomplete_detail,
        product_status,
        detail,
        stockId,
      ];

      console.log("Running UPDATE query:", updateQuery);
      console.log("With values:", updateValues);

      const updateResult = await (client || pool).query(
        updateQuery,
        updateValues
      );

      console.log("UPDATE query result:", updateResult.rows);

      return updateResult.rows[0];
    } else {
      // Jika tidak ditemukan, tambahkan baris baru
      console.log("No matching record found. Inserting new stock data.");

      const initialReservedStock = isReserved ? stok_tersedia : 0; // Jika "Sudah Dipesan", stok_dipesan sama dengan stok masuk

      const insertQuery = `
      INSERT INTO final_stock (id_produk, id_warna, id_finishing, id_lokasi, stok_tersedia,
        stok_dipesan, is_custom, is_raw_material, ukuran, id_kain, id_kaki, id_dudukan,
        bantal_peluk, bantal_sandaran, kantong_remot, is_complete,
        incomplete_detail, product_status, detail, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP)
      RETURNING *
    `;

      const insertValues = [
        id_produk,
        id_warna,
        id_finishing,
        id_lokasi,
        stok_tersedia,
        initialReservedStock, // Jika "Sudah Dipesan", stok_dipesan = stok_tersedia
        is_custom,
        is_raw_material,
        ukuran,
        id_kain,
        id_kaki,
        id_dudukan,
        bantal_peluk,
        bantal_sandaran,
        kantong_remot,
        is_complete,
        incomplete_detail,
        product_status,
        detail,
      ];

      console.log("Running INSERT query:", insertQuery);
      console.log("With values:", insertValues);

      const insertResult = await (client || pool).query(
        insertQuery,
        insertValues
      );

      console.log("INSERT query result:", insertResult.rows);

      return insertResult.rows[0];
    }
  },

  async getCompleteStockDetailsByProductId(id_produk) {
    console.log(
      "getCompleteStockDetailsByProductId called with id_produk:",
      id_produk
    ); // Log ID Produk yang diterima

    if (isNaN(id_produk)) {
      throw new Error("Invalid product ID"); // Pastikan ID produk valid
    }

    const queryParams = [id_produk]; // Menggunakan ID produk yang diterima
    const query = `
    SELECT 
      final_stock.id AS final_id,
      final_stock.id_produk AS final_id_produk,
      final_stock.id_warna AS final_id_warna,
      final_stock.id_finishing AS final_id_finishing,
      final_stock.id_lokasi AS final_id_lokasi,
      (final_stock.stok_tersedia - final_stock.stok_dipesan) AS final_stok_tersedia,
      final_stock.is_custom AS final_is_custom,
      final_stock.is_raw_material AS final_is_raw_material,
      final_stock.ukuran AS final_ukuran,
      final_stock.id_kain AS final_id_kain,
      final_stock.id_kaki AS final_id_kaki,
      final_stock.id_dudukan AS final_id_dudukan,
      final_stock.bantal_peluk AS final_bantal_peluk,
      final_stock.bantal_sandaran AS final_bantal_sandaran,
      final_stock.kantong_remot AS final_kantong_remot,
      final_stock.created_at AS final_created_at,
      final_stock.updated_at AS final_updated_at,
      final_stock.is_complete AS final_is_complete,
      final_stock.incomplete_detail AS final_incomplete_detail,
      final_stock.product_status AS final_product_status,
      final_stock.detail AS final_detail,

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
      warehouse.lokasi AS final_gudang,
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
  LEFT JOIN warehouse ON final_stock.id_lokasi = warehouse.id
  LEFT JOIN sofa ON produk.id_produk = sofa.id_produk
  LEFT JOIN kain AS sofa_kain ON sofa.id_kain = sofa_kain.id_kain
  LEFT JOIN kaki AS sofa_kaki ON sofa.id_kaki = sofa_kaki.id_kaki
  LEFT JOIN dudukan AS sofa_dudukan ON sofa.id_dudukan = sofa_dudukan.id_dudukan
  LEFT JOIN style ON sofa.id_style = style.id_style
  WHERE final_stock.id_produk = $1 
  AND (final_stock.stok_tersedia - final_stock.stok_dipesan) > 0
;
`;

    try {
      console.log("Executing query:", query); // Log query SQL yang dijalankan
      console.log("With parameters:", queryParams); // Log parameter yang dikirimkan ke query

      const result = await pool.query(query, queryParams);

      if (result.rows.length === 0) {
        console.log("No stock found for product ID:", id_produk); // Log jika tidak ada stok yang ditemukan
      } else {
        console.log(
          "Stock details fetched successfully for product ID:",
          id_produk
        ); // Log sukses
        console.log("Result rows:", result.rows); // Log hasil yang diterima dari database
      }

      return result.rows;
    } catch (error) {
      console.error(
        "Error while fetching stock details for product ID:",
        id_produk
      ); // Log jika ada error
      console.error("Error details:", error); // Log detil error
      throw error; // Lempar ulang error setelah log
    }
  },
};

module.exports = FinalStock;
