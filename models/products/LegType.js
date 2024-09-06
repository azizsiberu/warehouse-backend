// path: models/products/LegType.js
module.exports = (sequelize, DataTypes) => {
  const LegType = sequelize.define(
    "LegType",
    {
      id_kaki: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      jenis_kaki: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "kaki", // Nama tabel di database
      timestamps: false,
    }
  );

  return LegType;
};
