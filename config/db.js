// path: config/db.js

const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME, // Nama database dari Amazon RDS
  process.env.DB_USER, // Username dari Amazon RDS
  process.env.DB_PASSWORD, // Password dari Amazon RDS
  {
    host: process.env.DB_HOST, // Endpoint dari Amazon RDS
    port: process.env.DB_PORT || 5432, // Port PostgreSQL, default 5432
    dialect: "postgres",
    logging: false, // Set to true if you want to see SQL queries in the console
    dialectOptions: {
      ssl: {
        require: true, // Set true if RDS requires SSL
        rejectUnauthorized: false, // Allows self-signed certificates (use false if you're using RDS with SSL)
      },
    },
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Connected to PostgreSQL database on Amazon RDS"))
  .catch((err) => console.error("Unable to connect to the database:", err));

module.exports = sequelize;
