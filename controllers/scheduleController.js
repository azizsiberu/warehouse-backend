// path: controllers/scheduleController.js
const Schedule = require("../models/Schedule");
const FinalStock = require("../models/FinalStock");

const scheduleController = {
  // Ambil semua jadwal sementara dengan id dan nama produk
  async getAll(req, res) {
    try {
      const schedules = await Schedule.getAllSchedules();
      res.json(schedules); // Mengirimkan data yang sudah mencakup id_produk dan nama produk
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ message: "Failed to fetch schedules", error });
    }
  },

  // Ambil detail jadwal sementara berdasarkan ID
  async getScheduleDetails(req, res) {
    const { id } = req.params;
    try {
      const scheduleDetails = await Schedule.getScheduleDetailsById(id);
      if (!scheduleDetails) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      res.json(scheduleDetails); // Mengirimkan data detail jadwal
    } catch (error) {
      console.error("Error fetching schedule details by ID:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch schedule details", error });
    }
  },

  // Ambil detail stok berdasarkan ID (menggunakan getCompleteStockDetailsByProductId dari FinalStock)
  async findStockById(req, res) {
    const { id } = req.params;

    // Memastikan id_produk adalah angka
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" }); // Response jika ID tidak valid
    }

    try {
      console.log(
        `Fetching stock details for transaction/product ID: ${productId}`
      );

      // Call the findById method from FinalStock model to get stock details
      const stockDetails = await FinalStock.getCompleteStockDetailsByProductId(
        productId
      );

      if (stockDetails.length === 0) {
        return res.status(404).json({ message: "Stock not found" });
      }

      console.log("Successfully fetched stock details:", stockDetails);
      res.json(stockDetails); // Return stock details
    } catch (error) {
      console.error("Error fetching stock details:", error);
      res.status(500).json({ message: "Failed to fetch stock details", error });
    }
  },

  // 🔹 Simpan jadwal pengiriman final
  async createFinalSchedule(req, res) {
    try {
      console.log(
        "📩 Data diterima di backend:",
        JSON.stringify(req.body, null, 2)
      );

      const {
        id_transaksi,
        id_customer,
        tanggal_pengiriman,
        id_user_creator,
        id_user_sales,
        products,
      } = req.body;
      if (
        !id_transaksi ||
        !id_customer ||
        !tanggal_pengiriman ||
        !id_user_creator ||
        !id_user_sales ||
        !products.length
      ) {
        return res.status(400).json({ message: "Data tidak lengkap" });
      }

      const result = await Schedule.createFinalSchedule({
        id_transaksi,
        id_customer,
        tanggal_pengiriman,
        id_user_creator,
        id_user_sales,
        products,
      });

      res.status(201).json({
        message: "Jadwal pengiriman final berhasil dibuat",
        schedule_id: result.id_schedule,
      });
    } catch (error) {
      console.error("❌ Error saat membuat jadwal pengiriman:", error);
      res.status(500).json({
        message: "Gagal menyimpan jadwal pengiriman",
        error: error.message,
      });
    }
  },

  // 🔹 Finalisasi jadwal pengiriman
  async finalizeSchedule(req, res) {
    try {
      const { id_schedule } = req.params;
      if (!id_schedule) {
        return res.status(400).json({ message: "ID jadwal diperlukan" });
      }

      const result = await Schedule.finalizeSchedule(id_schedule);
      res.status(200).json(result);
    } catch (error) {
      console.error("❌ Error saat finalisasi pengiriman:", error);
      res.status(500).json({
        message: "Gagal memfinalisasi pengiriman",
        error: error.message,
      });
    }
  },

  // 🔹 Ambil semua jadwal pengiriman final
  async getAllFinalSchedules(req, res) {
    try {
      const schedules = await Schedule.getAllFinalSchedules();
      res.status(200).json(schedules);
    } catch (error) {
      console.error("❌ Error saat mengambil semua jadwal pengiriman:", error);
      res.status(500).json({
        message: "Gagal mengambil jadwal pengiriman",
        error: error.message,
      });
    }
  },

  // 🔹 Ambil detail jadwal pengiriman berdasarkan ID
  async getFinalScheduleById(req, res) {
    try {
      const { id_schedule } = req.params;
      if (!id_schedule) {
        return res.status(400).json({ message: "ID jadwal diperlukan" });
      }

      const scheduleDetail = await Schedule.getFinalScheduleById(id_schedule);
      if (!scheduleDetail) {
        return res.status(404).json({ message: "Jadwal tidak ditemukan" });
      }

      res.status(200).json(scheduleDetail);
    } catch (error) {
      console.error("❌ Error saat mengambil detail jadwal:", error);
      res.status(500).json({
        message: "Gagal mengambil detail jadwal",
        error: error.message,
      });
    }
  },
};

module.exports = scheduleController;
