// path: models/SubCategory.js
module.exports = (sequelize, DataTypes) => {
  const SubCategory = sequelize.define(
    "SubCategory",
    {
      id_subcategory: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_subkategori", // Sesuaikan dengan kolom di tabel
      },
      subcategory: {
        type: DataTypes.STRING,
        field: "subkategori",
      },
      category_id: {
        type: DataTypes.INTEGER,
        field: "id_kategori",
      },
    },
    {
      tableName: "subkategori",
      timestamps: false,
    }
  );

  SubCategory.associate = (models) => {
    SubCategory.belongsTo(models.Category, { foreignKey: "id_kategori" });
  };

  return SubCategory;
};
