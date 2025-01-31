// path: models/Schedule.js
const pool = require("../config/db");

const Schedule = {
  // Ambil semua jadwal sementara dengan id produk dan nama produk
  async getAllSchedules() {
    const result = await pool.query(`
      SELECT 
        t.id AS transaction_id,
        u.nama_lengkap AS sales_name,
        c.nama_pelanggan,
        t.tanggal_pengiriman,
        CONCAT(c.kabupaten, ' - ', c.provinsi) AS lokasi,
        ARRAY_AGG(p.id_produk) AS product_ids,  -- Array of product IDs
        ARRAY_AGG(p.nama) AS produk_names,  -- Array of product names
        (SELECT status FROM transaction_details td WHERE td.transaction_id = t.id GROUP BY status ORDER BY COUNT(status) DESC LIMIT 1) AS status
      FROM transactions t
      JOIN user_profiles u ON t.user_id = u.id_users
      JOIN customers c ON t.customer_id = c.id
      JOIN transaction_details td ON td.transaction_id = t.id
      JOIN produk p ON p.id_produk = td.id_produk
      GROUP BY t.id, u.nama_lengkap, c.nama_pelanggan, t.tanggal_pengiriman, c.kabupaten, c.provinsi
    `);
    return result.rows;
  },

  // Ambil detail jadwal sementara berdasarkan ID transaksi
  async getScheduleDetailsById(id) {
    try {
      console.log(`Fetching schedule details for transaction ID: ${id}`);

      // Execute the query to fetch the schedule details
      const result = await pool.query(
        `
        SELECT 
          t.id AS transaction_id,
          u.nama_lengkap AS sales_name,
          c.nama_pelanggan,
          c.nomor_hp,
          t.order_number,
          t.tanggal_transaksi,
          t.status_pembayaran,
          t.tanggal_pengiriman,
          t.catatan,
          c.alamat_pelanggan,  
          c.kelurahan, 
          c.kecamatan,  
          c.kabupaten,  
          c.provinsi,  
          ARRAY_AGG(
            JSON_BUILD_OBJECT(
              'product_id', p.id_produk, 
              'product_name', p.nama, 
              'quantity', td.jumlah,
              'unit_price', td.harga_satuan,
              'subtotal', td.subtotal,
              'custom', td.iscustom,
              'status', td.status,
              'product_photo', p.foto_produk, 
              'dimensi', p.panjang || ' x ' || p.lebar || ' x ' || p.tinggi,
              'warna', w.warna, 
              'finishing', f.finishing, 
              'catatan', td.catatan,
              'custom_details', JSON_BUILD_OBJECT(
                'dimensi', cd.dimensi,
                'bantal_peluk', cd.bantal_peluk,
                'bantal_sandaran', cd.bantal_sandaran,
                'kantong_remote', cd.kantong_remote,
                'puff', cd.puff,
                'kain', k.kain,
                'jenis_kaki', kaki.jenis_kaki,
                'dudukan', dudukan.dudukan
              ),
              'sofa_details', JSON_BUILD_OBJECT(
                'id_style', s.id_style,
                'style', st.style,
                'id_kain', s.id_kain,
                'kain', k_sofa.kain,
                'id_dudukan', s.id_dudukan,
                'dudukan', d.dudukan,
                'id_kaki', s.id_kaki,
                'jenis_kaki', ka.jenis_kaki,
                'bantal_peluk', s.bantal_peluk,
                'bantal_sandaran', s.bantal_sandaran,
                'kantong_remot', s.kantong_remot,
                'puff', s.puff
              )
            )
          ) AS product_details
        FROM transaction_details td
        JOIN transactions t ON t.id = td.transaction_id
        JOIN user_profiles u ON t.user_id = u.id_users
        JOIN customers c ON t.customer_id = c.id
        JOIN produk p ON p.id_produk = td.id_produk
        LEFT JOIN custom_details cd ON cd.transaction_detail_id = td.id
        LEFT JOIN kain k ON k.id_kain = cd.id_kain
        LEFT JOIN kaki kaki ON kaki.id_kaki = cd.id_kaki
        LEFT JOIN dudukan dudukan ON dudukan.id_dudukan = cd.id_dudukan
        LEFT JOIN finishing f ON f.id_finishing = td.id_finishing
        LEFT JOIN warna w ON w.id_warna = td.id_warna
        LEFT JOIN sofa s ON s.id_produk = p.id_produk
        LEFT JOIN style st ON s.id_style = st.id_style
        LEFT JOIN kain k_sofa ON s.id_kain = k_sofa.id_kain
        LEFT JOIN dudukan d ON s.id_dudukan = d.id_dudukan
        LEFT JOIN kaki ka ON s.id_kaki = ka.id_kaki
        WHERE t.id = $1
        GROUP BY t.id, u.nama_lengkap, c.nama_pelanggan, c.nomor_hp, t.order_number, t.tanggal_transaksi, t.status_pembayaran, t.tanggal_pengiriman, t.catatan,
                 c.alamat_pelanggan, c.kelurahan, c.kecamatan, c.kabupaten, c.provinsi
      `,
        [id]
      );

      // Log the result to see the returned data
      console.log(`Query result for transaction ID: ${id}:`, result.rows);

      // Log if no results are found
      if (result.rows.length === 0) {
        console.log(`No schedule found for transaction ID: ${id}`);
        throw new Error("Schedule not found");
      }

      // Log a success message with detailed transaction info
      console.log(
        `Successfully fetched schedule details for transaction ID: ${id}`,
        result.rows[0]
      );

      return result.rows[0];
    } catch (error) {
      console.error(
        `Error fetching schedule details for transaction ID: ${id}`,
        error
      );
      throw error; // rethrow the error after logging it
    }
  },
};

module.exports = Schedule;
