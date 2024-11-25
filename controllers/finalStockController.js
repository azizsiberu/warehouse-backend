// path: controllers/finalStockController.js
const FinalStock = require("../models/FinalStock");

const getAvailableStock = async (req, res) => {
  try {
    const { id_lokasi, id_produk } = req.query;

    if (!id_lokasi) {
      return res.status(400).json({ message: "Lokasi harus ditentukan." });
    }

    // Ambil data stok yang tersedia dari model
    const availableStock = await FinalStock.getAvailableStock({
      id_lokasi,
      id_produk,
    });

    res.status(200).json(availableStock);
  } catch (error) {
    console.error("Error fetching available stock:", error.message);
    res
      .status(500)
      .json({ message: "Gagal mengambil data stok", error: error.message });
  }
};

const getFinalStock = async (req, res) => {
  try {
    const allStock = await FinalStock.getAllStock(); // Memanggil model untuk mendapatkan semua stok
    res.status(200).json(allStock);
  } catch (error) {
    console.error("Error fetching all stock:", error.message);
    res.status(500).json({
      message: "Gagal mengambil data seluruh stok",
      error: error.message,
    });
  }
};

const getStockDetails = async (req, res) => {
  try {
    const { id_lokasi, id_produk } = req.query;

    if (!id_lokasi || !id_produk) {
      return res
        .status(400)
        .json({ message: "Lokasi dan produk harus ditentukan." });
    }

    const completeStockDetails = await FinalStock.getCompleteStockDetails({
      id_lokasi,
      id_produk,
    });

    res.status(200).json(completeStockDetails);
  } catch (error) {
    console.error("Error fetching complete stock details:", error.message);
    res
      .status(500)
      .json({ message: "Gagal mengambil detail stok", error: error.message });
  }
};

module.exports = {
  getAvailableStock,
  getFinalStock,
  getStockDetails,
};
