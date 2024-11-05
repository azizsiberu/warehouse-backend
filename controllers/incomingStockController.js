// path: controllers/incomingStockController.js
const IncomingStock = require("../models/IncomingStock");

const addIncomingStock = async (req, res) => {
  const {
    id_produk,
    id_warna,
    id_finishing,
    is_custom,
    is_raw_material,
    jumlah,
    id_user,
    id_lokasi,
    additionalOptions,
  } = req.body;

  console.log("Request body received:", req.body); // Logging seluruh data yang diterima dari request

  // Check for missing fields
  const missingFields = {
    id_produk: !id_produk ? "Field 'id_produk' is required" : undefined,
    jumlah: !jumlah ? "Field 'jumlah' is required" : undefined,
    id_user: !id_user ? "Field 'id_user' is required" : undefined,
    id_lokasi: !id_lokasi ? "Field 'id_lokasi' is required" : undefined,
  };

  // Filter out undefined values
  const missingFieldsFiltered = Object.entries(missingFields).reduce(
    (acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    },
    {}
  );

  // Jika ada field yang tidak lengkap, kirimkan error dengan detail spesifik
  if (Object.keys(missingFieldsFiltered).length > 0) {
    console.log("Data yang diperlukan tidak lengkap:", missingFieldsFiltered); // Logging field yang hilang
    return res.status(400).json({
      message: "Data yang diperlukan tidak lengkap",
      missingFields: missingFieldsFiltered,
    });
  }

  try {
    console.log(
      "Attempting to add incoming stock with the following details:",
      {
        id_produk,
        id_warna,
        id_finishing,
        is_custom,
        is_raw_material,
        jumlah,
        id_user,
        id_lokasi,
      }
    );

    const incoming_stock_id = await IncomingStock.addIncomingStock({
      id_produk,
      id_warna,
      id_finishing,
      is_custom,
      is_raw_material,
      jumlah,
      id_user,
      id_lokasi,
    });

    console.log(
      "Incoming stock added successfully with ID:",
      incoming_stock_id
    );

    if (is_custom && additionalOptions && additionalOptions.length > 0) {
      console.log(
        "Adding custom stock options for incoming stock ID:",
        incoming_stock_id,
        "with options:",
        additionalOptions
      );
      await IncomingStock.addStockCustom(incoming_stock_id, additionalOptions);
      console.log(
        "Custom stock options added successfully for incoming stock ID:",
        incoming_stock_id
      );
    }

    res.status(201).json({ message: "Stok masuk berhasil ditambahkan" });
  } catch (error) {
    console.error("Error adding incoming stock:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    }); // Menggunakan console.error untuk detail error yang lebih lengkap
    res
      .status(500)
      .json({ message: "Gagal menambahkan stok masuk", error: error.message });
  }
};

module.exports = {
  addIncomingStock,
};
