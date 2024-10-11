// path: models/Product.js
const pool = require("../config/db");

// Fungsi untuk mendapatkan semua produk
const getAllProducts = async () => {
  const query = `
    SELECT produk.id_produk, 
       produk.nama, 
       produk.id_kategori, 
       produk.id_subkategori, 
       produk.id_vendor, 
       produk.old_sku, 
       produk.estimasi_waktu_produksi, 
       produk.panjang, 
       produk.lebar, 
       produk.tinggi, 
       produk.deskripsi, 
       produk.harga_jual, 
       produk.created_at, 
       produk.foto_produk, 
       produk.masa_garansi, 
       produk.id_jenis, 
       produk.sku, 
           kategori.kategori AS kategori, 
           subkategori.subkategori AS subkategori, 
           vendor.nama_vendor AS vendor
    FROM produk
    JOIN kategori ON produk.id_kategori = kategori.id_kategori
    JOIN subkategori ON produk.id_subkategori = subkategori.id_subkategori
    
    JOIN vendor ON produk.id_vendor = vendor.id_vendor
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Fungsi untuk mendapatkan detail produk berdasarkan ID
const getProductById = async (id) => {
  const query = `
    SELECT produk.id_produk, 
           produk.nama, 
           produk.id_kategori, 
           produk.id_subkategori, 
           produk.id_vendor, 
           produk.old_sku, 
           produk.estimasi_waktu_produksi, 
           produk.panjang, 
           produk.lebar, 
           produk.tinggi, 
           produk.deskripsi, 
           produk.harga_jual, 
           produk.created_at, 
           produk.foto_produk, 
           produk.masa_garansi, 
           produk.id_jenis, 
           produk.sku, 
           kategori.kategori AS kategori, 
           subkategori.subkategori AS subkategori, 
           kain.kain AS kain,
           warna.warna AS warna, 
           kaki.jenis_kaki AS kaki, 
           dudukan.dudukan AS dudukan,
           style.style AS style, 
           vendor.nama_vendor AS vendor, 
           vendor.url_logo AS logo_vendor,
           sofa.id_sofa, 
           sofa.id_produk AS sofa_id_produk, 
           sofa.id_style, 
           sofa.id_kain, 
           sofa.id_dudukan, 
           sofa.id_kaki, 
           sofa.bantal_peluk, 
           sofa.bantal_sandaran, 
           sofa.kantong_remot, 
           sofa.puff
    FROM produk
    LEFT JOIN kategori ON produk.id_kategori = kategori.id_kategori
    LEFT JOIN subkategori ON produk.id_subkategori = subkategori.id_subkategori
    LEFT JOIN sofa ON produk.id_produk = sofa.id_produk
    LEFT JOIN kain ON sofa.id_kain = kain.id_kain
    LEFT JOIN warna ON warna.id_kain = kain.id_kain
    LEFT JOIN kaki ON sofa.id_kaki = kaki.id_kaki
    LEFT JOIN dudukan ON sofa.id_dudukan = dudukan.id_dudukan
    LEFT JOIN style ON sofa.id_style = style.id_style
    LEFT JOIN vendor ON produk.id_vendor = vendor.id_vendor
    WHERE produk.id_produk = $1;
  `;
  const { rows } = await pool.query(query, [id]);

  // Memfilter properti yang null
  const filteredResult = Object.fromEntries(
    Object.entries(rows[0]).filter(
      ([_, value]) => value !== null && value !== 0
    )
  );

  return filteredResult;
};

// Fungsi untuk memperbarui produk
const updateProduct = async (id, productData) => {
  const {
    nama,
    harga_jual, // Perbarui sesuai kolom yang benar
    id_kategori,
    id_subkategori,
    id_warna, // Kolom dari warna
    id_kain, // Kolom dari kain
    id_style, // Kolom dari style
    id_vendor,
  } = productData;
  const query = `
    UPDATE produk
    SET nama = $1, 
        harga_jual = $2, 
        id_kategori = $3, 
        id_subkategori = $4, 
        id_warna = $5, 
        id_kain = $6, 
        id_style = $7, 
        id_vendor = $8
    WHERE id_produk = $9
    RETURNING *
  `;
  const values = [
    nama,
    harga_jual,
    id_kategori,
    id_subkategori,
    id_warna,
    id_kain,
    id_style,
    id_vendor,
    id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

module.exports = {
  getAllProducts,
  getProductById,
  updateProduct,
};
