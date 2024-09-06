// path: models/Product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id_product: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_produk", // Sesuai dengan kolom di tabel
      },
      name: {
        type: DataTypes.STRING,
        field: "nama", // Nama kolom di database adalah 'nama'
      },
      sku: {
        type: DataTypes.STRING,
      },
      product_image: {
        type: DataTypes.STRING,
        field: "foto_produk", // Nama kolom di database adalah 'foto_produk'
      },
      selling_price: {
        type: DataTypes.FLOAT,
        field: "harga_jual", // Nama kolom di database adalah 'harga_jual'
      },
      category_id: {
        type: DataTypes.INTEGER,
        field: "id_kategori", // Nama kolom di database adalah 'id_kategori'
      },
      subcategory_id: {
        type: DataTypes.INTEGER,
        field: "id_subkategori", // Nama kolom di database adalah 'id_subkategori'
      },
      vendor_id: {
        type: DataTypes.INTEGER,
        field: "id_vendor", // Nama kolom di database adalah 'id_vendor'
      },
      type_id: {
        type: DataTypes.INTEGER,
        field: "id_jenis", // Nama kolom di database adalah 'id_jenis'
      },
    },
    {
      tableName: "produk", // Nama tabel di database adalah 'produk'
      timestamps: false,
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, { foreignKey: "id_kategori" }); // Nama kolom di database adalah 'id_kategori'
    Product.belongsTo(models.SubCategory, { foreignKey: "id_subkategori" }); // Nama kolom di database adalah 'id_subkategori'
    Product.belongsTo(models.Vendor, { foreignKey: "id_vendor" }); // Nama kolom di database adalah 'id_vendor'
    Product.belongsTo(models.ProductType, { foreignKey: "id_jenis" }); // Nama kolom di database adalah 'id_jenis'
  };

  return Product;
};
