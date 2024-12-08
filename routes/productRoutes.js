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

// Route untuk menambahkan shipping details
router.post("/shipping", productController.addShippingDetails);

// Route untuk mendapatkan shipping details berdasarkan id_produk
router.get(
  "/shipping/:id_produk",
  productController.getShippingDetailsByProductId
);

// Route untuk memperbarui shipping details berdasarkan id_produk
router.put("/shipping/:id_produk", productController.updateShippingDetails);

// Route untuk menghapus shipping details berdasarkan id_produk
router.delete("/shipping/:id_produk", productController.deleteShippingDetails);

module.exports = router;
