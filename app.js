require("dotenv").config();

// Require instrument.js first!
require("./instrument");
const productRoutes = require("./routes/productRoutes");
const attributeRoutes = require("./routes/attributeRoutes");
const authRoutes = require("./routes/authRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const incomingStockRoutes = require("./routes/incomingStockRoutes");

const express = require("express");
const Sentry = require("@sentry/node");
const cors = require("cors");
const authMiddleware = require("./middlewares/authMiddleware");

const app = express();
app.use(cors());

app.use(express.json());

// Lindungi rute produk dan atribut
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/attributes", authMiddleware, attributeRoutes);
app.use("/api/warehouses", authMiddleware, warehouseRoutes);
app.use("/api/incoming-stocks", authMiddleware, incomingStockRoutes);

app.use("/api/auth", authRoutes);

// Add this after all routes,
// but before any other error-handling middlewares are defined
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
