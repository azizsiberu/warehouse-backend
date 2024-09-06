// path: models/ProductType.js
module.exports = (sequelize, DataTypes) => {
  const ProductType = sequelize.define(
    "ProductType",
    {
      id_type: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_jenis", // Nama kolom di database adalah 'id_jenis'
      },
      type_name: {
        type: DataTypes.STRING,
        field: "jenis_produk", // Nama kolom di database adalah 'jenis_produk'
      },
    },
    {
      tableName: "jenis_produk", // Nama tabel di database adalah 'jenis_produk'
      timestamps: false,
    }
  );

  return ProductType;
};
