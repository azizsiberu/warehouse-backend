// path: models/Product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id_product: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_produk",
      },
      name: {
        type: DataTypes.STRING,
        field: "nama",
      },
      description: {
        type: DataTypes.STRING,
        field: "deskripsi",
      },
      panjang: {
        type: DataTypes.FLOAT,
      },
      lebar: {
        type: DataTypes.FLOAT,
      },
      tinggi: {
        type: DataTypes.FLOAT,
      },

      sku: {
        type: DataTypes.STRING,
      },
      product_image: {
        type: DataTypes.STRING,
        field: "foto_produk",
      },
      selling_price: {
        type: DataTypes.FLOAT,
        field: "harga_jual",
      },
      category_id: {
        type: DataTypes.INTEGER,
        field: "id_kategori",
      },
      subcategory_id: {
        type: DataTypes.INTEGER,
        field: "id_subkategori", // Sesuaikan dengan kolom di tabel
      },
      vendor_id: {
        type: DataTypes.INTEGER,
        field: "id_vendor",
      },
      type_id: {
        type: DataTypes.INTEGER,
        field: "id_jenis",
      },
    },
    {
      tableName: "produk",
      timestamps: false,

      getterMethods: {
        dimension() {
          return `${this.panjang} x ${this.lebar} x ${this.tinggi}`;
        },
      },
    }
  );

  // Relasi ke tabel lain
  Product.associate = (models) => {
    Product.belongsTo(models.Category, { foreignKey: "id_kategori" });
    Product.belongsTo(models.SubCategory, { foreignKey: "id_subkategori" });
    Product.belongsTo(models.Vendor, { foreignKey: "id_vendor" });
    Product.belongsTo(models.ProductType, { foreignKey: "id_jenis" });
    Product.hasOne(models.Sofa, { foreignKey: "id_produk" });
  };

  return Product;
};
