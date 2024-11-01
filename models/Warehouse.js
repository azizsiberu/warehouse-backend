// models/Warehouse.js
const db = require("../config/db");

const Warehouse = {
  async getAllWarehouses() {
    const result = await db.query("SELECT id, lokasi FROM warehouse");
    return result.rows;
  },
};

module.exports = Warehouse;
