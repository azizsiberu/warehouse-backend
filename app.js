require("dotenv").config();

// Require instrument.js first!
require("./instrument");
const authRoutes = require("./routes/authRoutes");

const express = require("express");
const Sentry = require("@sentry/node");

const app = express();

// Add your routes, etc.
app.get("/", function rootHandler(req, res) {
  res.end("Hello world!");
});

app.use("/api/auth", authRoutes);

// Add this after all routes,
// but before any other error-handling middlewares are defined
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
