// path: models/Fabric.js
module.exports = (sequelize, DataTypes) => {
  const Fabric = sequelize.define(
    "Fabric",
    {
      id_fabric: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_kain", // Nama kolom di database adalah 'id_kain'
      },
      fabric_name: {
        type: DataTypes.STRING,
        field: "kain", // Nama kolom di database adalah 'kain'
      },
    },
    {
      tableName: "kain", // Nama tabel di database adalah 'kain'
      timestamps: false,
    }
  );

  return Fabric;
};
