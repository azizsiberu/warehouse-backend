// path: routes/stockOverviewRoutes.js
const express = require("express");
const StockOverviewController = require("../controllers/StockOverviewController");

const router = express.Router();

router.get("/distribution", StockOverviewController.getDistribution);
router.get("/trend", StockOverviewController.getStockTrend);
router.get("/recent", StockOverviewController.getRecentActivities);
router.get("/low-stock", StockOverviewController.getLowStockWarning);
router.get("/main-stats", StockOverviewController.getMainStats);

router.get(
  "/transactions/:productId",
  StockOverviewController.getStockTransactions
);

module.exports = router;
