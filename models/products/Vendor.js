// path: models/Vendor.js
module.exports = (sequelize, DataTypes) => {
  const Vendor = sequelize.define(
    "Vendor",
    {
      id_vendor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      vendor_name: {
        type: DataTypes.STRING,
        field: "nama_vendor", // Nama kolom di database adalah 'nama_vendor'
      },
      phone: {
        type: DataTypes.STRING,
        field: "telepon", // Nama kolom di database adalah 'telepon'
      },
      email: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
        field: "alamat", // Nama kolom di database adalah 'alamat'
      },
      logo_url: {
        type: DataTypes.STRING,
        field: "url_logo", // Nama kolom di database adalah 'url_logo'
      },
    },
    {
      tableName: "vendor", // Nama tabel di database adalah 'vendor'
      timestamps: false,
    }
  );

  return Vendor;
};
