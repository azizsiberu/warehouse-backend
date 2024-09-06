// path: models/Sofa.js
module.exports = (sequelize, DataTypes) => {
  const Sofa = sequelize.define(
    "Sofa",
    {
      id_sofa: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        field: "id_produk", // Nama kolom di database adalah 'id_produk'
      },
      style_id: {
        type: DataTypes.INTEGER,
        field: "id_style", // Nama kolom di database adalah 'id_style'
      },
      fabric_id: {
        type: DataTypes.INTEGER,
        field: "id_kain", // Nama kolom di database adalah 'id_kain'
      },
      seat_type_id: {
        type: DataTypes.INTEGER,
        field: "id_dudukan", // Nama kolom di database adalah 'id_dudukan'
      },
      leg_type_id: {
        type: DataTypes.INTEGER,
        field: "id_kaki", // Nama kolom di database adalah 'id_kaki'
      },
      throw_pillows: {
        type: DataTypes.INTEGER,
        field: "bantal_peluk", // Nama kolom di database adalah 'bantal_peluk'
      },
      back_cushions: {
        type: DataTypes.INTEGER,
        field: "bantal_sandaran", // Nama kolom di database adalah 'bantal_sandaran'
      },
      remote_pockets: {
        type: DataTypes.BOOLEAN,
        field: "kantong_remot", // Nama kolom di database adalah 'kantong_remot'
      },
      puff: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      tableName: "sofa", // Nama tabel di database adalah 'sofa'
      timestamps: false,
    }
  );

  return Sofa;
};