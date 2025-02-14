// path: controllers/outgoingStockController.js

const Kendaraan = require("../models/Kendaraan");
const TeamGudang = require("../models/TeamGudang");
const FinalStock = require("../models/FinalStock");
const OutgoingStock = require("../models/OutgoingStock");
const pool = require("../config/db");

const outgoingStockController = {
  // Stok Keluar berdasarkan menu outgoingstock
  async createOutgoingStock(req, res) {
    const client = await pool.connect();
    try {
      const payload = req.body;

      console.log("=== Incoming Request: Create Outgoing Stock ===");
      console.log("Payload received:", JSON.stringify(payload, null, 2));

      if (!Array.isArray(payload) || payload.length === 0) {
        throw new Error("Payload tidak valid.");
      }

      await client.query("BEGIN");

      for (const item of payload) {
        // 1. Proses driver
        let driverId = item.id_kurir || null;
        if (!driverId && item.driver?.nama) {
          console.log(`Processing driver: ${item.driver.nama}`);
          driverId = await TeamGudang.processTeamMember(
            { nama: item.driver.nama },
            "Driver",
            client
          );
          console.log(`Driver processed successfully. ID: ${driverId}`);
        }

        // 2. Proses partner
        const partnerIds = [];
        if (item.partners?.length > 0) {
          for (const partner of item.partners) {
            let partnerId = partner.id || null;
            if (!partnerId && partner.nama) {
              console.log(`Processing partner: ${partner.nama}`);
              partnerId = await TeamGudang.processTeamMember(
                { nama: partner.nama },
                "Partner",
                client
              );
              console.log(`Partner processed successfully. ID: ${partnerId}`);
            }
            partnerIds.push(partnerId);
          }
        }

        // 3. Proses kendaraan
        let vehicleId = item.id_kendaraan || null;
        if (!vehicleId && item.vehicle) {
          console.log(
            `Processing vehicle: Nomor Polisi ${item.vehicle.nomor_polisi}`
          );
          vehicleId = await Kendaraan.processVehicle(
            {
              nomor_polisi: item.vehicle.nomor_polisi,
              jenis_kendaraan: item.vehicle.jenis_kendaraan,
            },
            client
          );
          console.log(`Vehicle processed successfully. ID: ${vehicleId}`);
        }

        // 4. Kurangi stok tersedia
        console.log(
          `Reducing available stock for final_stock ID ${item.id_final_stock} by ${item.jumlah}`
        );
        await FinalStock.reduceStockQuantity(
          item.id_final_stock,
          item.jumlah,
          client
        );

        // 4B. **Kurangi stok dipesan** (stok yang sudah dipesan)
        console.log(
          `Reducing reserved stock for final_stock ID ${item.id_final_stock} by ${item.jumlah}`
        );
        await FinalStock.reduceReservedStock(
          item.id_final_stock,
          item.jumlah,
          client
        );

        // 5. Ambil data final_stock
        console.log(
          `Fetching final_stock details for ID ${item.id_final_stock}`
        );
        const finalStockData = await FinalStock.findById(
          item.id_final_stock,
          client
        );

        // 6. Simpan ke outgoing_stock
        const outgoingStock = await OutgoingStock.addOutgoingStock(
          {
            ...finalStockData,
            ...item,
            id_kurir: driverId,
            id_kendaraan: vehicleId,
          },
          client
        );

        console.log(
          `Outgoing stock ID ${outgoingStock.id} added successfully.`
        );

        // 7. Tambahkan partner ke outgoing_stock_partners
        for (const partnerId of partnerIds) {
          await OutgoingStock.addOutgoingPartner(
            outgoingStock.id,
            partnerId,
            client
          );
          console.log(`Partner with ID ${partnerId} added successfully.`);
        }
      }

      await client.query("COMMIT");
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
  // stok keluar berdasarkan menu finalschedule
  async createOutgoingStockWithReservedReduction(req, res) {
    const client = await pool.connect();
    try {
      console.log("=== Incoming Request: Create Outgoing Stock ===" + req.body);
      const payload = req.body;

      console.log(
        "=== Incoming Request: Create Outgoing Stock With Reserved Reduction ==="
      );
      console.log("Payload received:", JSON.stringify(payload, null, 2));

      if (!Array.isArray(payload) || payload.length === 0) {
        throw new Error("Payload tidak valid.");
      }

      await client.query("BEGIN");

      let id_schedule = null; // Untuk menyimpan ID schedule dari transaksi

      for (const item of payload) {
        id_schedule = item.id_schedule; // Ambil ID schedule dari payload

        // 1. Proses driver
        let driverId = item.id_kurir || null;
        if (!driverId && item.driver?.nama) {
          console.log(`Processing driver: ${item.driver.nama}`);
          driverId = await TeamGudang.processTeamMember(
            { nama: item.driver.nama },
            "Driver",
            client
          );
          console.log(`Driver processed successfully. ID: ${driverId}`);
        }

        // 2. Proses partner
        const partnerIds = [];
        if (item.partners?.length > 0) {
          for (const partner of item.partners) {
            let partnerId = partner.id || null;
            if (!partnerId && partner.nama) {
              console.log(`Processing partner: ${partner.nama}`);
              partnerId = await TeamGudang.processTeamMember(
                { nama: partner.nama },
                "Partner",
                client
              );
              console.log(`Partner processed successfully. ID: ${partnerId}`);
            }
            partnerIds.push(partnerId);
          }
        }

        // 3. Proses kendaraan
        let vehicleId = item.id_kendaraan || null;
        if (!vehicleId && item.vehicle) {
          console.log(
            `Processing vehicle: Nomor Polisi ${item.vehicle.nomor_polisi}`
          );
          vehicleId = await Kendaraan.processVehicle(
            {
              nomor_polisi: item.vehicle.nomor_polisi,
              jenis_kendaraan: item.vehicle.jenis_kendaraan,
            },
            client
          );
          console.log(`Vehicle processed successfully. ID: ${vehicleId}`);
        }

        // 4. Kurangi stok tersedia
        console.log(
          `Reducing available stock for final_stock ID ${item.id_final_stock} by ${item.jumlah}`
        );
        await FinalStock.reduceStockQuantity(
          item.id_final_stock,
          item.jumlah,
          client
        );

        // 4B. Kurangi stok dipesan
        console.log(
          `Reducing reserved stock for final_stock ID ${item.id_final_stock} by ${item.jumlah}`
        );
        await FinalStock.reduceReservedStock(
          item.id_final_stock,
          item.jumlah,
          client
        );

        // 5. Ambil data final_stock
        console.log(
          `Fetching final_stock details for ID ${item.id_final_stock}`
        );
        const finalStockData = await FinalStock.findById(
          item.id_final_stock,
          client
        );

        // 6. Simpan ke outgoing_stock
        const outgoingStock = await OutgoingStock.addOutgoingStock(
          {
            ...finalStockData,
            ...item,
            id_kurir: driverId,
            id_kendaraan: vehicleId,
          },
          client
        );

        console.log(
          `Outgoing stock ID ${outgoingStock.id} added successfully.`
        );

        // 7. Tambahkan partner ke outgoing_stock_partners
        for (const partnerId of partnerIds) {
          await OutgoingStock.addOutgoingPartner(
            outgoingStock.id,
            partnerId,
            client
          );
          console.log(`Partner with ID ${partnerId} added successfully.`);
        }
      }

      // 8. **Update status_pengiriman menjadi 'Dikirim' di final_schedules**
      if (id_schedule) {
        console.log(
          `Updating status_pengiriman menjadi 'Dikirim' untuk id_schedule: ${id_schedule}`
        );
        await client.query(
          `UPDATE final_schedules SET status_pengiriman = 'Dikirim', updated_at = NOW() WHERE id = $1`,
          [id_schedule]
        );
        console.log(
          `✅ Status pengiriman di final_schedules telah diperbarui.`
        );
      }

      // 9. **Ambil id_transaksi_detail dari final_schedule_details**
      console.log(
        `Fetching id_transaksi_detail dari final_schedule_details untuk id_schedule: ${id_schedule}`
      );
      const transactionDetailIds = await client.query(
        `SELECT id_transaksi_detail FROM final_schedule_details WHERE id_schedule = $1`,
        [id_schedule]
      );

      if (transactionDetailIds.rows.length > 0) {
        const idTransaksiDetails = transactionDetailIds.rows.map(
          (row) => row.id_transaksi_detail
        );

        // 10. **Update status menjadi 'Terkirim' di transaction_details**
        console.log(
          `Updating status transaksi menjadi 'Terkirim' untuk id_transaksi_detail:`,
          idTransaksiDetails
        );
        await client.query(
          `UPDATE transaction_details SET status = 'Terkirim' WHERE id IN (${idTransaksiDetails
            .map((_, i) => `$${i + 1}`)
            .join(",")})`,
          idTransaksiDetails
        );
        console.log(
          `✅ Status transaksi di transaction_details telah diperbarui.`
        );

        console.log(
          `✅ Status transaksi di transaction_details telah diperbarui.`
        );
      } else {
        console.log(
          `⚠️ Tidak ada id_transaksi_detail yang ditemukan untuk id_schedule: ${id_schedule}`
        );
      }

      await client.query("COMMIT");
      res.status(201).json({
        message:
          "Pengiriman berhasil disimpan dengan pengurangan stok dipesan. Status pengiriman telah diperbarui.",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(
        "❌ Error in createOutgoingStockWithReservedReduction:",
        error.message
      );
      res
        .status(500)
        .json({ message: "Terjadi kesalahan.", error: error.message });
    } finally {
      client.release();
    }
  },
};

module.exports = outgoingStockController;
