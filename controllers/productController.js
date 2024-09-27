const {
  Product,
  Category,
  Vendor,
  ProductType,
  SubCategory,
  Sofa,
  SeatType,
  Style,
  Fabric,
  LegType,
} = require("../models");

exports.getProductList = async (req, res) => {
  try {
    const productList = await Product.findAll({
      attributes: [
        "id_product",
        "name",
        "sku",
        "product_image",
        "selling_price",
      ],
      include: [
        { model: Category, attributes: ["category"] },
        { model: SubCategory, attributes: ["subkategori"] },
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

    // Fetch basic product details
    const product = await Product.findOne({
      where: { id_product: id },
      include: [
        { model: Category, attributes: ["category"] },
        {
          model: SubCategory,
          attributes: ["id_subcategory", "subcategory"],
          as: "SubCategory",
        },
        { model: Vendor, attributes: ["vendor_name", "logo_url"] },
        { model: ProductType, attributes: ["type_name"] },
        {
          model: Sofa,
          include: [
            { model: Style, attributes: ["style_name"] },
            { model: Fabric, attributes: ["fabric_name"] },
            { model: SeatType, attributes: ["seat_type_name"] },
            { model: LegType, attributes: ["jenis_kaki"] },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let productDetail = {
      id_product: product.id_product,
      dimension: product.dimension,
      name: product.name,
      sku: product.sku,
      description: product.description,
      product_image: product.product_image,
      selling_price: product.selling_price,
      category: product.Category?.category,
      subcategory: product.SubCategory
        ? product.SubCategory.subcategory
        : undefined,
      vendor: product.Vendor?.vendor_name,
      vendorlogo: product.Vendor?.logo_url,
      product_type: product.ProductType?.type_name,
    };

    if (product.Sofa) {
      productDetail = {
        ...productDetail,
        style: product.Sofa.Style?.style_name,
        fabric: product.Sofa.Fabric?.fabric_name,
        seat_type: product.Sofa.SeatType?.seat_type_name,
        leg_type: product.Sofa.LegType?.jenis_kaki,
        throw_pillows: product.Sofa.throw_pillows,
        back_cushions: product.Sofa.back_cushions,
        remote_pockets: product.Sofa.remote_pockets,
        puff: product.Sofa.puff,
      };
    }

    // Filter out null values
    const filteredProductDetail = Object.fromEntries(
      Object.entries(productDetail).filter(
        ([_, value]) => value !== null && value !== ""
      )
    );

    res.json(filteredProductDetail);
    console.log(filteredProductDetail);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch product details." });
  }
};
