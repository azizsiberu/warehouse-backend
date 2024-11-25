// models/Warehouse.js
const pool = require("../config/db");

const Warehouse = {
  async getAllWarehouses() {
    const result = await pool.query("SELECT id, lokasi FROM warehouse");
    return result.rows;
  },
};

module.exports = Warehouse;
