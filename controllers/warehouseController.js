// controllers/warehouseController.js
const Warehouse = require("../models/Warehouse");

const warehouseController = {
  async getAllWarehouses(req, res) {
    try {
      const warehouses = await Warehouse.getAllWarehouses();
      res.status(200).json(warehouses);
    } catch (error) {
      console.error("Error saat mengambil data warehouse:", error);
      res.status(500).json({ message: "Error saat mengambil data warehouse" });
    }
  },
};

module.exports = warehouseController;
