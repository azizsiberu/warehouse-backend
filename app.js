require("dotenv").config();

// Require instrument.js first!
require("./instrument");
const productRoutes = require("./routes/productRoutes");
const attributeRoutes = require("./routes/attributeRoutes")

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
app.use('/api/attributes', attributeRoutes);


// Add this after all routes,
// but before any other error-handling middlewares are defined
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
