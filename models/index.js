const Sequelize = require("sequelize");
const sequelize = require("../config/db");

// Import semua model dari folder 'products'
const Product = require("./products/Product")(sequelize, Sequelize.DataTypes);
const Sofa = require("./products/Sofa")(sequelize, Sequelize.DataTypes);
const Category = require("./products/Category")(sequelize, Sequelize.DataTypes);
const SubCategory = require("./products/SubCategory")(
  sequelize,
  Sequelize.DataTypes
);
const Vendor = require("./products/Vendor")(sequelize, Sequelize.DataTypes);
const ProductType = require("./products/ProductType")(
  sequelize,
  Sequelize.DataTypes
);
const Fabric = require("./products/Fabric")(sequelize, Sequelize.DataTypes);
const Style = require("./products/Style")(sequelize, Sequelize.DataTypes);
const SeatType = require("./products/SeatType")(sequelize, Sequelize.DataTypes);

// Membuat objek untuk mengelola semua model
const db = {
  Product,
  Sofa,
  Category,
  SubCategory,
  Vendor,
  ProductType,
  Fabric,
  Style,
  SeatType,
};

// Definisikan asosiasi setelah semua model diinisialisasi
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Hubungkan Sequelize dan ekspor modul
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
