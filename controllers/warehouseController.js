// controllers/warehouseController.js
const Warehouse = require("../models/Warehouse");

const warehouseController = {
  // Mendapatkan semua warehouse
  async getAllWarehouses(req, res) {
    try {
      const warehouses = await Warehouse.getAllWarehouses();
      res.status(200).json(warehouses);
    } catch (error) {
      console.error("Error saat mengambil data warehouse:", error);
      res.status(500).json({ message: "Error saat mengambil data warehouse" });
    }
  },

  // Menambahkan warehouse baru
  async createWarehouse(req, res) {
    const { lokasi } = req.body;
    if (!lokasi) {
      return res.status(400).json({ message: "Lokasi warehouse harus diisi." });
    }

    try {
      const newWarehouse = await Warehouse.createWarehouse(lokasi);
      res.status(201).json(newWarehouse);
    } catch (error) {
      console.error("Error saat menambahkan warehouse baru:", error);
      res
        .status(500)
        .json({ message: "Error saat menambahkan warehouse baru" });
    }
  },

  // Memperbarui warehouse berdasarkan ID
  async updateWarehouse(req, res) {
    const { id } = req.params;
    const { lokasi } = req.body;

    if (!lokasi) {
      return res.status(400).json({ message: "Lokasi warehouse harus diisi." });
    }

    try {
      const updatedWarehouse = await Warehouse.updateWarehouse(id, lokasi);
      if (!updatedWarehouse) {
        return res.status(404).json({ message: "Warehouse tidak ditemukan." });
      }
      res.status(200).json(updatedWarehouse);
    } catch (error) {
      console.error("Error saat memperbarui warehouse:", error);
      res.status(500).json({ message: "Error saat memperbarui warehouse" });
    }
  },

  // Menghapus warehouse berdasarkan ID
  async deleteWarehouse(req, res) {
    const { id } = req.params;

    try {
      const deletedWarehouse = await Warehouse.deleteWarehouse(id);
      if (!deletedWarehouse) {
        return res.status(404).json({ message: "Warehouse tidak ditemukan." });
      }
      res.status(200).json({ message: "Warehouse berhasil dihapus." });
    } catch (error) {
      console.error("Error saat menghapus warehouse:", error);
      res.status(500).json({ message: "Error saat menghapus warehouse" });
    }
  },
};

module.exports = warehouseController;
