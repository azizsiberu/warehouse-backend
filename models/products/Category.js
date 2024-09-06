// path: models/Category.js
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id_category: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_kategori", // Nama kolom di database adalah 'id_kategori'
      },
      category: {
        type: DataTypes.STRING,
        field: "kategori", // Nama kolom di database adalah 'kategori'
      },
    },
    {
      tableName: "kategori", // Nama tabel di database adalah 'kategori'
      timestamps: false,
    }
  );

  return Category;
};
