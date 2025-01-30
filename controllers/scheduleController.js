// path: controllers/scheduleController.js
const Schedule = require("../models/Schedule");

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

  // Ambil jadwal sementara berdasarkan ID dengan id dan nama produk
  async getById(req, res) {
    const { id } = req.params;
    try {
      const schedule = await Schedule.getScheduleById(id);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      res.json(schedule); // Mengirimkan data jadwal final dengan id_produk dan nama produk
    } catch (error) {
      console.error("Error fetching schedule by ID:", error);
      res.status(500).json({ message: "Failed to fetch schedule", error });
    }
  },
};

module.exports = scheduleController;
