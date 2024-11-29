// path: controllers/outgoingStockController.js

const Kendaraan = require("../models/Kendaraan");
const TeamGudang = require("../models/TeamGudang");
const FinalStock = require("../models/FinalStock");
const OutgoingStock = require("../models/OutgoingStock");
const pool = require("../config/db");

const outgoingStockController = {
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

        // 4. Kurangi stok
        console.log(
          `Reducing stock for final_stock ID ${item.id_final_stock} by ${item.jumlah}`
        );
        await FinalStock.reduceStockQuantity(
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
};

module.exports = outgoingStockController;
