// path: models/index.js
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

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
const LegType = require("./products/LegType")(sequelize, Sequelize.DataTypes); // Pastikan LegType sudah benar

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
  LegType, // Pastikan LegType diinisialisasi di sini
};

// Definisikan asosiasi setelah semua model diinisialisasi
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
