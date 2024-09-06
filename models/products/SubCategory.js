// path: models/SubCategory.js
module.exports = (sequelize, DataTypes) => {
  const SubCategory = sequelize.define(
    "SubCategory",
    {
      id_subcategory: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_subkategori", // Nama kolom di database adalah 'id_subkategori'
      },
      subcategory: {
        type: DataTypes.STRING,
        field: "subkategori", // Nama kolom di database adalah 'subkategori'
      },
      category_id: {
        type: DataTypes.INTEGER,
        field: "id_kategori", // Nama kolom di database adalah 'id_kategori'
      },
    },
    {
      tableName: "subkategori", // Nama tabel di database adalah 'subkategori'
      timestamps: false,
    }
  );

  return SubCategory;
};
