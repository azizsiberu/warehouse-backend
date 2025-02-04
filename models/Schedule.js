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
                 ;
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
        fs.id AS schedule_id,
        u_sales.nama_lengkap AS sales_name,
        c.*,  -- Menyertakan semua kolom dari tabel customers
        fs.tanggal_pengiriman,
        fs.status_pengiriman,

        ARRAY_AGG(
            JSON_BUILD_OBJECT(
                'product_id', p.id_produk, 
                'product_name', p.nama, 
                'dimensi', p.panjang || ' x ' || p.lebar || ' x ' || p.tinggi,
                'product_description', p.deskripsi,
                'product_photo', p.foto_produk, 

                'schedule_details', JSON_BUILD_OBJECT(
                    'id_schedule_detail', fsd.id,
                    'id_schedule', fsd.id_schedule,
                    'id_final_stock', fsd.id_final_stock,
                    'jumlah', fsd.jumlah,
                    'id_transaksi_detail', fsd.id_transaksi_detail,
                    'created_at', fsd.created_at,
                    'updated_at', fsd.updated_at
                ),

                'final_stock', JSON_BUILD_OBJECT(
                    'final_stock_id', f.id,
                    'stok_tersedia', f.stok_tersedia,
                    'stok_dipesan', f.stok_dipesan,
                    'is_custom', f.is_custom,
                    'is_raw_material', f.is_raw_material,
                    'ukuran', f.ukuran,
                    'product_status', f.product_status,
                    'final_stock_detail', f.detail,
                    'lokasi', ws.lokasi,
                    'warna', w.warna,
                    'finishing', fn.finishing,
                    'kain', k.kain,
                    'jenis_kaki', ka.jenis_kaki,
                    'jenis_dudukan', d.dudukan
                ),

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
        ) AS product_details

        FROM final_schedules fs
        JOIN user_profiles u_sales ON fs.id_user_sales = u_sales.id_users
        JOIN customers c ON fs.id_customer = c.id
        JOIN final_schedule_details fsd ON fs.id = fsd.id_schedule
        JOIN final_stock f ON fsd.id_final_stock = f.id
        JOIN produk p ON f.id_produk = p.id_produk

        LEFT JOIN sofa s ON p.id_produk = s.id_produk
        LEFT JOIN style st ON s.id_style = st.id_style
        LEFT JOIN kain k_sofa ON s.id_kain = k_sofa.id_kain
        LEFT JOIN kaki ka_sofa ON s.id_kaki = ka_sofa.id_kaki
        LEFT JOIN dudukan d_sofa ON s.id_dudukan = d_sofa.id_dudukan

        LEFT JOIN warna w ON f.id_warna = w.id_warna
        LEFT JOIN finishing fn ON f.id_finishing = fn.id_finishing
        LEFT JOIN kain k ON f.id_kain = k.id_kain
        LEFT JOIN kaki ka ON f.id_kaki = ka.id_kaki
        LEFT JOIN dudukan d ON f.id_dudukan = d.id_dudukan
        LEFT JOIN warehouse ws ON f.id_lokasi = ws.id

        WHERE fs.id = $1
        GROUP BY fs.id, u_sales.id_users, u_sales.nama_lengkap, c.id, fsd.id;
    `;

    console.log(`Fetching final schedule for ID: ${id_schedule}`);

    try {
      const { rows } = await pool.query(query, [id_schedule]);

      console.log(
        `Query executed successfully for schedule ID: ${id_schedule}`
      );
      console.log(`Raw query result:`, rows);

      if (rows.length) {
        console.log(`Final schedule details found for ID: ${id_schedule}`);
      } else {
        console.log(`No final schedule found for ID: ${id_schedule}`);
      }

      return rows.length ? rows : null;
    } catch (error) {
      console.error(
        `Error fetching final schedule for ID: ${id_schedule}`,
        error
      );
      throw error;
    }
  },
};

module.exports = Schedule;
