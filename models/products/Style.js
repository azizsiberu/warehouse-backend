// path: models/Style.js
module.exports = (sequelize, DataTypes) => {
  const Style = sequelize.define(
    "Style",
    {
      id_style: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      style_name: {
        type: DataTypes.STRING,
        field: "style", // Nama kolom di database adalah 'style'
      },
    },
    {
      tableName: "style", // Nama tabel di database adalah 'style'
      timestamps: false,
    }
  );

  return Style;
};
