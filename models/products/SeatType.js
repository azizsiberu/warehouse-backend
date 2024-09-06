// path: models/SeatType.js
module.exports = (sequelize, DataTypes) => {
  const SeatType = sequelize.define(
    "SeatType",
    {
      id_seat_type: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_dudukan", // Nama kolom di database adalah 'id_dudukan'
      },
      seat_type_name: {
        type: DataTypes.STRING,
        field: "dudukan", // Nama kolom di database adalah 'dudukan'
      },
    },
    {
      tableName: "dudukan", // Nama tabel di database adalah 'dudukan'
      timestamps: false,
    }
  );

  return SeatType;
};
