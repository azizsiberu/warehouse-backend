//path: routes/attributeRoutes.js
const express = require("express");
const AttributeController = require("../controllers/AttributeController");

const router = express.Router();

// Routes untuk attribute
router.get("/kain", AttributeController.getKain);
router.get("/dudukan", AttributeController.getDudukan);
router.get("/kaki", AttributeController.getKaki);
router.get("/finishing", AttributeController.getFinishing);

// Route untuk mendapatkan warna berdasarkan id_kain
router.get("/warna/:id_kain", AttributeController.getWarnaByKainId);

module.exports = router;
