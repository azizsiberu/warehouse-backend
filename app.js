require("dotenv").config();

// Require instrument.js first!
require("./instrument");
const sequelize = require("./config/db"); // Import sequelize instance
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const express = require("express");
const Sentry = require("@sentry/node");
const cors = require("cors");

const app = express();
app.use(cors());

// Sync models with the database
sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });

// Add your routes, etc.
app.get("/", function rootHandler(req, res) {
  res.end("Hello world!");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Add this after all routes,
// but before any other error-handling middlewares are defined
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
