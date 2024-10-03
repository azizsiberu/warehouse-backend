// path: constrollers/productController.js
const Product = require("../models/Product");

// Mengambil semua produk
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Mengambil produk berdasarkan ID
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Memperbarui produk
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const productData = req.body;
  try {
    const updatedProduct = await Product.updateProduct(id, productData);
    if (!updatedProduct) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  updateProduct,
};
