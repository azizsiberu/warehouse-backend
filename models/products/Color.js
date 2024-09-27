// path: models/Warna.js
module.exports = (sequelize, DataTypes) => {
  const Warna = sequelize.define(
    "Warna",
    {
      id_warna: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_warna",
      },
      name: {
        type: DataTypes.STRING,
        field: "warna",
      },
      fabric_id: {
        type: DataTypes.INTEGER,
        field: "id_kain",
      },
    },
    {
      tableName: "warna",
      timestamps: false,
    }
  );

  Warna.associate = (models) => {
    Warna.belongsTo(models.Fabric, { foreignKey: "id_kain" });
  };

  return Warna;
};
