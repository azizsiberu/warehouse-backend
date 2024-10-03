// path: routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Route untuk mendapatkan semua produk
router.get("/", productController.getAllProducts);

// Route untuk mendapatkan produk berdasarkan ID
router.get("/:id", productController.getProductById);

// Route untuk memperbarui produk berdasarkan ID
router.put("/:id", productController.updateProduct);

module.exports = router;
