// routes/warehouseRoutes.js
const express = require("express");
const router = express.Router();
const warehouseController = require("../controllers/warehouseController");

// Route untuk mendapatkan data warehouse
router.get("/", warehouseController.getAllWarehouses);

// Route untuk membuat warehouse baru
router.post("/", warehouseController.createWarehouse);

// Route untuk memperbarui warehouse berdasarkan ID
router.put("/:id", warehouseController.updateWarehouse);

// Route untuk menghapus warehouse berdasarkan ID
router.delete("/:id", warehouseController.deleteWarehouse);

module.exports = router;
