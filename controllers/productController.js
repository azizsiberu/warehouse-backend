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

// Menambahkan shipping details
const addShippingDetails = async (req, res) => {
  try {
    const shippingData = req.body;
    console.log("Received shipping data for addition:", shippingData);

    const result = await Product.addShippingDetails(shippingData);
    console.log("Shipping details added successfully:", result);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding shipping details:", error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan shipping details", error });
  }
};

// Mengambil shipping details berdasarkan id_produk
const getShippingDetailsByProductId = async (req, res) => {
  const { id_produk } = req.params;
  console.log(`Fetching shipping details for id_produk: ${id_produk}`);

  try {
    const result = await Product.getShippingDetailsByProductId(id_produk);
    console.log("Shipping details fetched:", result);

    if (!result) {
      // Mengembalikan respons sukses dengan pesan default
      return res
        .status(200)
        .json({ message: "Shipping details belum tersedia", data: null });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(
      `Error fetching shipping details for id_produk: ${id_produk}`,
      error
    );
    res
      .status(500)
      .json({ message: "Gagal mengambil shipping details", error });
  }
};

// Memperbarui shipping details
const updateShippingDetails = async (req, res) => {
  const { id_produk } = req.params;
  const shippingData = req.body;
  console.log(
    `Updating shipping details for id_produk: ${id_produk}`,
    shippingData
  );

  try {
    const result = await Product.updateShippingDetails(id_produk, shippingData);
    console.log("Shipping details updated:", result);

    if (!result) {
      console.warn(`Shipping details not found for id_produk: ${id_produk}`);
      return res
        .status(404)
        .json({ message: "Shipping details tidak ditemukan" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(
      `Error updating shipping details for id_produk: ${id_produk}`,
      error
    );
    res
      .status(500)
      .json({ message: "Gagal memperbarui shipping details", error });
  }
};

// Menghapus shipping details berdasarkan id_produk
const deleteShippingDetails = async (req, res) => {
  const { id_produk } = req.params;
  console.log(`Deleting shipping details for id_produk: ${id_produk}`);

  try {
    const result = await Product.deleteShippingDetails(id_produk);
    console.log("Shipping details deleted:", result);

    if (!result) {
      console.warn(`Shipping details not found for id_produk: ${id_produk}`);
      return res
        .status(404)
        .json({ message: "Shipping details tidak ditemukan" });
    }

    res.status(200).json({ message: "Shipping details berhasil dihapus" });
  } catch (error) {
    console.error(
      `Error deleting shipping details for id_produk: ${id_produk}`,
      error
    );
    res
      .status(500)
      .json({ message: "Gagal menghapus shipping details", error });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  updateProduct,
  addShippingDetails,
  getShippingDetailsByProductId,
  updateShippingDetails,
  deleteShippingDetails,
};
