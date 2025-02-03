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
        ARRAY_AGG(p.id_produk) AS product_ids,  
        ARRAY_AGG(p.nama) AS produk_names, 
        (
          SELECT td.status
          FROM transaction_details td
          WHERE td.transaction_id = t.id
          AND td.status NOT IN ('Terkirim', 'Dibatalkan', 'Siap Dikirim') 
          GROUP BY td.status
          ORDER BY COUNT(td.status) DESC 
          LIMIT 1
        ) AS status
      FROM transactions t
      JOIN user_profiles u ON t.user_id = u.id_users
      JOIN customers c ON t.customer_id = c.id
      JOIN transaction_details td ON td.transaction_id = t.id
      JOIN produk p ON p.id_produk = td.id_produk
      GROUP BY t.id, u.nama_lengkap, c.nama_pelanggan, t.tanggal_pengiriman, c.kabupaten, c.provinsi
      HAVING (
        SELECT COUNT(*) 
        FROM transaction_details td 
        WHERE td.transaction_id = t.id 
        AND td.status NOT IN ('Terkirim', 'Dibatalkan', 'Siap Dikirim') 
      ) > 0
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
        fs.id AS final_id,
        fs.tanggal_pengiriman,
        fs.status_pengiriman,
        u_sales.id_users AS sales_id,
        u_sales.nama_lengkap AS sales_name,

        -- Data Customer (format tabular, tidak dalam JSON)
        c.id AS customer_id,
        c.nama AS customer_nama,
        c.alamat AS customer_alamat,
        c.telepon AS customer_telepon,

        -- Data Produk dan Final Stock (dikumpulkan dalam satu array JSON)
        ARRAY_AGG(
          JSON_STRIP_NULLS(
            JSON_BUILD_OBJECT(
              'id_produk', p.id_produk,
              'produk_nama', p.nama,
              'dimensi', p.panjang || ' x ' || p.lebar || ' x ' || p.tinggi,
              'produk_deskripsi', p.deskripsi,
              'produk_foto', p.foto_produk,

              -- Data Final Stock (dikumpulkan dalam satu JSON lengkap)
              'final_stock', JSON_BUILD_OBJECT(
                'final_stock_id', f.id,
                'stok_tersedia', f.stok_tersedia,
                'stok_dipesan', f.stok_dipesan,
                'is_custom', f.is_custom,
                'is_raw_material', f.is_raw_material,
                'ukuran', f.ukuran,
                'product_status', f.product_status,
                'final_stock_detail', f.detail,
                'lokasi', l.nama_lokasi,
                
                -- Data dari tabel yang FK ke final_stock
                'warna', w.warna,
                'finishing', fn.finishing,
                'kain', k.kain,
                'jenis_kaki', ka.jenis_kaki,
                'jenis_dudukan', d.dudukan
              ),

              -- Data Sofa (hanya akan muncul jika produk merupakan sofa)
              'sofa_details', JSON_BUILD_OBJECT(
                'id_sofa', s.id_sofa,
                'id_style', s.id_style,
                'style', st.style,
                'id_kain', s.id_kain,
                'kain', k_sofa.kain,
                'id_dudukan', s.id_dudukan,
                'dudukan', d_sofa.dudukan,
                'id_kaki', s.id_kaki,
                'jenis_kaki', ka_sofa.jenis_kaki,
                'bantal_peluk', s.bantal_peluk,
                'bantal_sandaran', s.bantal_sandaran,
                'kantong_remot', s.kantong_remot,
                'puff', s.puff
              )
            )
          )
        ) AS product_details

      FROM final_schedules fs
      JOIN user_profiles u_sales ON fs.id_user_sales = u_sales.id_users
      JOIN customers c ON fs.id_customer = c.id
      JOIN final_schedule_details fsd ON fs.id = fsd.id_schedule
      JOIN final_stock f ON fsd.id_final_stock = f.id
      JOIN produk p ON f.id_produk = p.id_produk
      LEFT JOIN sofa s ON p.id_produk = s.id_produk  -- Jika bukan sofa, akan NULL
      LEFT JOIN style st ON s.id_style = st.id_style
      LEFT JOIN warna w ON f.id_warna = w.id_warna
      LEFT JOIN finishing fn ON f.id_finishing = fn.id_finishing
      LEFT JOIN kain k ON f.id_kain = k.id_kain
      LEFT JOIN kain k_sofa ON s.id_kain = k_sofa.id_kain
      LEFT JOIN kaki ka ON f.id_kaki = ka.id_kaki
      LEFT JOIN kaki ka_sofa ON s.id_kaki = ka_sofa.id_kaki
      LEFT JOIN dudukan d ON f.id_dudukan = d.id_dudukan
      LEFT JOIN dudukan d_sofa ON s.id_dudukan = d_sofa.id_dudukan
      LEFT JOIN lokasi l ON f.id_lokasi = l.id_lokasi
      WHERE fs.id = $1
      GROUP BY fs.id, u_sales.id_users, u_sales.nama_lengkap, c.id, c.nama, c.alamat, c.telepon;
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

  async createFinalSchedule({
    id_transaksi,
    id_customer,
    tanggal_pengiriman,
    id_user_creator,
    id_user_sales,
    products,
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 🔥 Simpan data final_schedules
      const scheduleQuery = `
      INSERT INTO final_schedules (id_transaksi, id_customer, tanggal_pengiriman, id_user_creator, id_user_sales)
      VALUES ($1, $2, $3, $4, $5) RETURNING id;
    `;
      const { rows } = await client.query(scheduleQuery, [
        id_transaksi,
        id_customer,
        tanggal_pengiriman,
        id_user_creator,
        id_user_sales,
      ]);

      const id_schedule = rows[0].id;

      // 🔹 Simpan detail produk ke final_schedule_details
      for (const product of products) {
        const detailQuery = `
        INSERT INTO final_schedule_details (id_schedule, id_final_stock, jumlah, id_transaksi_detail)
        VALUES ($1, $2, $3, $4);
      `;
        await client.query(detailQuery, [
          id_schedule,
          product.id_final_stock,
          product.jumlah,
          product.id_transaksi_detail,
        ]);

        // 🔥 UPDATE status di transaction_details menjadi "Siap Dikirim"
        const updateStatusQuery = `
        UPDATE transaction_details
        SET status = 'Siap Dikirim'
        WHERE id = $1;
      `;
        await client.query(updateStatusQuery, [product.id_transaksi_detail]);

        // 🔥 UPDATE stok_dipesan di final_stock (tambahkan jumlah produk yang dipesan)
        const updateFinalStockQuery = `
        UPDATE final_stock
        SET stok_dipesan = stok_dipesan + $1 
        WHERE id = $2;
      `;
        await client.query(updateFinalStockQuery, [
          product.jumlah, // Jumlah yang dipesan
          product.id_final_stock, // ID final stok
        ]);
      }

      await client.query("COMMIT");
      return { id_schedule };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
  // 🔹 Finalisasi pengiriman: Kurangi stok & update transaksi
  async finalizeSchedule(id_schedule) {
    const client = await pool.connect();
    try {
      console.log("📩 Data diterima di backend:", req.body);

      await client.query("BEGIN");

      // 🔹 Ambil detail final schedule
      const detailsQuery = `
        SELECT id_final_stock, jumlah, id_transaksi_detail
        FROM final_schedule_details
        WHERE id_schedule = $1;
      `;
      const { rows: scheduleDetails } = await client.query(detailsQuery, [
        id_schedule,
      ]);

      if (!scheduleDetails.length) {
        throw new Error("Tidak ada detail jadwal yang ditemukan.");
      }

      // 🔹 Proses update stok & status transaksi
      for (const detail of scheduleDetails) {
        const { id_final_stock, jumlah, id_transaksi_detail } = detail;

        // 🔥 Kurangi stok final_stock
        const updateStockQuery = `
          UPDATE final_stock
          SET final_stok_tersedia = final_stok_tersedia - $1
          WHERE id = $2 AND final_stok_tersedia >= $1
          RETURNING *;
        `;
        const { rowCount: stockUpdated } = await client.query(
          updateStockQuery,
          [jumlah, id_final_stock]
        );

        if (!stockUpdated) {
          throw new Error(
            `Stok tidak mencukupi untuk final_stock ID: ${id_final_stock}`
          );
        }

        // 🔥 Update status di transaction_details
        const updateTransactionQuery = `
          UPDATE transaction_details
          SET status_produk = 'Terkirim'
          WHERE id = $1;
        `;
        await client.query(updateTransactionQuery, [id_transaksi_detail]);
      }

      // 🔥 Update status pengiriman di final_schedules
      const updateScheduleQuery = `
        UPDATE final_schedules
        SET status_pengiriman = 'terkirim'
        WHERE id = $1;
      `;
      await client.query(updateScheduleQuery, [id_schedule]);

      await client.query("COMMIT");
      return { message: "Jadwal berhasil difinalisasi" };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
  // 🔹 Ambil semua jadwal pengiriman final
  async getAllFinalSchedules() {
    const query = `
      SELECT 
        fs.id AS schedule_id,
        u_sales.nama_lengkap AS sales,
        c.nama_pelanggan AS pelanggan,
        CONCAT(c.kecamatan, ' - ', c.kabupaten) AS lokasi,
        STRING_AGG(p.nama, ' - ') AS nama_produk,
        fs.tanggal_pengiriman
      FROM final_schedules fs
      JOIN user_profiles u_sales ON fs.id_user_sales = u_sales.id_users
      JOIN customers c ON fs.id_customer = c.id
      JOIN final_schedule_details fsd ON fs.id = fsd.id_schedule
      JOIN final_stock f ON fsd.id_final_stock = f.id
      JOIN produk p ON f.id_produk = p.id_produk
      GROUP BY fs.id, u_sales.nama_lengkap, c.nama_pelanggan, c.kecamatan, c.kabupaten, fs.tanggal_pengiriman
      ORDER BY fs.tanggal_pengiriman DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  // 🔹 Ambil detail jadwal pengiriman berdasarkan ID
  async getFinalScheduleById(id_schedule) {
    const query = `
      SELECT 
        fs.id AS final_id,
        fs.tanggal_pengiriman,
        fs.status_pengiriman,
        u_sales.nama_lengkap AS sales,
        c.*,

        -- Data Produk
        p.id_produk,
        p.nama AS produk_nama,
        p.panjang,
        p.lebar,
        p.tinggi,
        p.deskripsi AS produk_deskripsi,

        -- Data Final Stock
        f.id AS final_stock_id,
        f.stok_tersedia,
        f.stok_dipesan,
        f.is_custom,
        f.is_raw_material,
        f.ukuran,
        f.product_status,
        f.detail AS final_stock_detail,

        -- Data Warna, Finishing, dan Material
        w.warna AS warna_produk,
        fn.finishing AS jenis_finishing,
        k.kain AS jenis_kain,
        ka.jenis_kaki,
        d.dudukan AS jenis_dudukan,

        -- Data Sofa (Jika Produk adalah Sofa)
        s.id_sofa,
        s.id_style,
        s.id_kain AS sofa_id_kain,
        s.id_dudukan AS sofa_id_dudukan,
        s.id_kaki AS sofa_id_kaki,
        s.bantal_peluk AS sofa_bantal_peluk,
        s.bantal_sandaran AS sofa_bantal_sandaran,
        s.kantong_remot AS sofa_kantong_remot,
        s.puff AS sofa_puff,

        -- Data Transaction Details
        td.id AS transaction_detail_id,
        td.*
        
      FROM final_schedules fs
      JOIN user_profiles u_sales ON fs.id_user_sales = u_sales.id_users
      JOIN customers c ON fs.id_customer = c.id
      JOIN final_schedule_details fsd ON fs.id = fsd.id_schedule
      JOIN final_stock f ON fsd.id_final_stock = f.id
      JOIN produk p ON f.id_produk = p.id_produk
      LEFT JOIN sofa s ON p.id_produk = s.id_produk  -- Hanya join jika produk ini adalah sofa
      LEFT JOIN warna w ON f.id_warna = w.id_warna
      LEFT JOIN finishing fn ON f.id_finishing = fn.id_finishing
      LEFT JOIN kain k ON f.id_kain = k.id_kain
      LEFT JOIN kaki ka ON f.id_kaki = ka.id_kaki
      LEFT JOIN dudukan d ON f.id_dudukan = d.id_dudukan
      JOIN transaction_details td ON fsd.id_transaksi_detail = td.id
      WHERE fs.id = $1;
    `;

    const { rows } = await pool.query(query, [id_schedule]);
    return rows.length ? rows : null;
  },
};

module.exports = Schedule;
