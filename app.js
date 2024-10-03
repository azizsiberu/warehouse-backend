require("dotenv").config();

// Require instrument.js first!
require("./instrument");
const productRoutes = require("./routes/productRoutes");

const express = require("express");
const Sentry = require("@sentry/node");
const cors = require("cors");

const app = express();
app.use(cors());

// Add your routes, etc.
app.get("/", function rootHandler(req, res) {
  res.end("Hello world!");
});

app.use("/api/products", productRoutes);

// Add this after all routes,
// but before any other error-handling middlewares are defined
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
