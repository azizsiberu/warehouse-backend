// path: models/StockOverview.js
const pool = require("../config/db");

const StockOverview = {
  // Distribusi stok berdasarkan lokasi
  async getDistributionByLocation() {
    const query = `
    SELECT 
      warehouse.lokasi AS warehouse_name,
      produk.nama AS product_name,
      SUM(final_stock.stok_tersedia) AS total_stock
    FROM final_stock
    JOIN produk ON final_stock.id_produk = produk.id_produk
    JOIN warehouse ON final_stock.id_lokasi = warehouse.id
    GROUP BY warehouse.lokasi, produk.nama;
  `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Distribusi stok berdasarkan kategori
  async getDistributionByCategory() {
    const query = `
    SELECT 
      kategori.kategori,
      produk.nama AS product_name,
      SUM(final_stock.stok_tersedia) AS total_stock
    FROM final_stock
    JOIN produk ON final_stock.id_produk = produk.id_produk
    JOIN kategori ON produk.id_kategori = kategori.id_kategori
    GROUP BY kategori.kategori, produk.nama;
  `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Tren stok bulan ini
  async getStockTrend() {
    const incomingQuery = `
    SELECT 
      warehouse.lokasi AS warehouse_name,
      SUM(CASE WHEN date_part('month', created_at) = date_part('month', CURRENT_DATE) 
                THEN jumlah ELSE 0 END) AS total_incoming_this_month,
      SUM(CASE WHEN date_part('month', created_at) = date_part('month', CURRENT_DATE) - 1 
                THEN jumlah ELSE 0 END) AS total_incoming_last_month
    FROM incoming_stock
    JOIN warehouse ON incoming_stock.id_lokasi = warehouse.id
    WHERE (
        (date_part('month', CURRENT_DATE) > 1 AND date_part('year', created_at) = date_part('year', CURRENT_DATE)) OR
        (date_part('month', CURRENT_DATE) = 1 AND date_part('month', created_at) = 12 AND date_part('year', created_at) = date_part('year', CURRENT_DATE) - 1)
    )
    GROUP BY warehouse.lokasi;
  `;

    const outgoingQuery = `
    SELECT 
      warehouse.lokasi AS warehouse_name,
      SUM(CASE WHEN date_part('month', created_at) = date_part('month', CURRENT_DATE) 
                THEN jumlah ELSE 0 END) AS total_outgoing_this_month,
      SUM(CASE WHEN date_part('month', created_at) = date_part('month', CURRENT_DATE) - 1 
                THEN jumlah ELSE 0 END) AS total_outgoing_last_month
    FROM outgoing_stock
    JOIN warehouse ON outgoing_stock.id_lokasi = warehouse.id
    WHERE (
        (date_part('month', CURRENT_DATE) > 1 AND date_part('year', created_at) = date_part('year', CURRENT_DATE)) OR
        (date_part('month', CURRENT_DATE) = 1 AND date_part('month', created_at) = 12 AND date_part('year', created_at) = date_part('year', CURRENT_DATE) - 1)
    )
    GROUP BY warehouse.lokasi;
  `;

    const incoming = await pool.query(incomingQuery);
    const outgoing = await pool.query(outgoingQuery);

    return {
      incoming: incoming.rows,
      outgoing: outgoing.rows,
    };
  },

  // Aktivitas terbaru
  async getRecentActivities() {
    const incomingQuery = `
    SELECT 
      incoming_stock.*,
      produk.nama AS product_name,
      kategori.kategori AS category_name,
      warehouse.lokasi AS warehouse_name
    FROM incoming_stock
    JOIN produk ON incoming_stock.id_produk = produk.id_produk
    JOIN kategori ON produk.id_kategori = kategori.id_kategori
    JOIN warehouse ON incoming_stock.id_lokasi = warehouse.id
    ORDER BY incoming_stock.created_at DESC
    LIMIT 5;
  `;

    const outgoingQuery = `
    SELECT 
      outgoing_stock.*,
      produk.nama AS product_name,
      kategori.kategori AS category_name,
      warehouse.lokasi AS warehouse_name
    FROM outgoing_stock
    JOIN produk ON outgoing_stock.id_produk = produk.id_produk
    JOIN kategori ON produk.id_kategori = kategori.id_kategori
    JOIN warehouse ON outgoing_stock.id_lokasi = warehouse.id
    ORDER BY outgoing_stock.created_at DESC
    LIMIT 5;
  `;

    const incoming = await pool.query(incomingQuery);
    const outgoing = await pool.query(outgoingQuery);

    return {
      incoming: incoming.rows,
      outgoing: outgoing.rows,
    };
  },

  // Peringatan stok rendah
  async getLowStockWarning() {
    const query = `
    SELECT 
      final_stock.*,
      produk.nama AS product_name,
      kategori.kategori AS category_name,
      warehouse.lokasi AS warehouse_name
    FROM final_stock
    JOIN produk ON final_stock.id_produk = produk.id_produk
    JOIN kategori ON produk.id_kategori = kategori.id_kategori
    JOIN warehouse ON final_stock.id_lokasi = warehouse.id
    WHERE final_stock.stok_tersedia < 10;
  `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Statistik utama
  async getMainStats() {
    const query = `
      SELECT
        (SELECT SUM(stok_tersedia) FROM final_stock) AS total_stock,
        (SELECT COUNT(*) FROM warehouse) AS total_warehouses,
        (SELECT COUNT(*) FROM final_stock WHERE stok_tersedia > 0) AS total_products_with_stock
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  async getStockTransactions(productId, warehouseId = null) {
    const query = `
      SELECT 
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
    
    -- Spesifikasi awal dari sofa
    sofa.id_kain AS sofa_kain,
    sofa.id_kaki AS sofa_kaki,
    sofa.id_dudukan AS sofa_dudukan,
    sofa.bantal_peluk AS sofa_bantal_peluk,
    sofa.bantal_sandaran AS sofa_bantal_sandaran,
    sofa.kantong_remot AS sofa_kantong_remot,
    
    -- Spesifikasi custom dan transaksi dari incoming_stock
    incoming_stock.id AS incoming_id,
    incoming_stock.id_kain AS incoming_kain,
    incoming_stock.id_warna AS incoming_warna,
    incoming_stock.id_finishing AS incoming_finishing,
    incoming_stock.id_kaki AS incoming_kaki,
    incoming_stock.id_dudukan AS incoming_dudukan,
    incoming_stock.bantal_peluk AS incoming_bantal_peluk,
    incoming_stock.bantal_sandaran AS incoming_bantal_sandaran,
    incoming_stock.kantong_remot AS incoming_kantong_remot,
    incoming_stock.jumlah AS incoming_jumlah,
    incoming_stock.created_at AS incoming_date,
    warehouse.lokasi AS incoming_warehouse,
    
    -- Spesifikasi custom dan transaksi dari outgoing_stock
    outgoing_stock.id AS outgoing_id,
    outgoing_stock.id_kain AS outgoing_kain,
    outgoing_stock.id_warna AS outgoing_warna,
    outgoing_stock.id_finishing AS outgoing_finishing,
    outgoing_stock.id_kaki AS outgoing_kaki,
    outgoing_stock.id_dudukan AS outgoing_dudukan,
    outgoing_stock.bantal_peluk AS outgoing_bantal_peluk,
    outgoing_stock.bantal_sandaran AS outgoing_bantal_sandaran,
    outgoing_stock.kantong_remot AS outgoing_kantong_remot,
    outgoing_stock.jumlah AS outgoing_jumlah,
    outgoing_stock.created_at AS outgoing_date,
    warehouse_outgoing.lokasi AS outgoing_warehouse

    FROM produk
    JOIN sofa ON produk.id_produk = sofa.id_produk
    LEFT JOIN kategori ON produk.id_kategori = kategori.id_kategori
    LEFT JOIN subkategori ON produk.id_subkategori = subkategori.id_subkategori
    LEFT JOIN vendor ON produk.id_vendor = vendor.id_vendor
    LEFT JOIN jenis_produk ON produk.id_jenis = jenis_produk.id_jenis

    -- Relasi ke Incoming Stock
    LEFT JOIN incoming_stock ON produk.id_produk = incoming_stock.id_produk
    LEFT JOIN warehouse ON incoming_stock.id_lokasi = warehouse.id

    -- Relasi ke Outgoing Stock
    LEFT JOIN outgoing_stock ON produk.id_produk = outgoing_stock.id_produk
    LEFT JOIN warehouse AS warehouse_outgoing ON outgoing_stock.id_lokasi = warehouse_outgoing.id

    WHERE produk.id_produk = $1
      AND (
        $2::INTEGER IS NULL -- Tidak ada filter gudang
        OR incoming_stock.id_lokasi = $2::INTEGER -- Filter incoming berdasarkan gudang
        OR outgoing_stock.id_lokasi = $2::INTEGER -- Filter outgoing berdasarkan gudang
      )
    ORDER BY COALESCE(incoming_stock.created_at, outgoing_stock.created_at) DESC;
    `;
    const result = await pool.query(query, [productId, warehouseId]);
    return result.rows;
  },
};

module.exports = StockOverview;
