// path: controllers/productController.js

const { Product, Category, Vendor, ProductType } = require("../models");

exports.getProductList = async (req, res) => {
  try {
    const productList = await Product.findAll({
      attributes: ["name", "sku", "product_image", "selling_price"],
      include: [
        { model: Category, attributes: ["category"] },
        { model: Vendor, attributes: ["vendor_name"] },
        { model: ProductType, attributes: ["type_name"] },
      ],
    });
    res.json(productList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch product data." });
  }
};

exports.getProductDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({
      where: { id_product: id },
      include: [
        { model: Category, attributes: ["category"] },
        { model: Vendor, attributes: ["vendor_name"] },
        { model: ProductType, attributes: ["type_name"] },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch product details." });
  }
};
