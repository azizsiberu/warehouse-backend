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
};

module.exports = scheduleController;
