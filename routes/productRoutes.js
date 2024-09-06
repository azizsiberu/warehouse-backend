// path: routes/productRoutes.js
const express = require("express");
const {
  getProductList,
  getProductDetail,
} = require("../controllers/productController");
const router = express.Router();

router.get("/", getProductList);
router.get("/:id", getProductDetail);

module.exports = router;
