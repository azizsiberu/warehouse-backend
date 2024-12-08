// path: controllers/StockOverviewController.js
const StockOverview = require("../models/StockOverview");

const StockOverviewController = {
  async getDistribution(req, res) {
    try {
      const byLocation = await StockOverview.getDistributionByLocation();
      const byCategory = await StockOverview.getDistributionByCategory();
      res.json({ byLocation, byCategory });
    } catch (error) {
      console.error("Error fetching distribution data:", error.message);
      res.status(500).json({ message: "Error fetching distribution data." });
    }
  },

  async getStockTrend(req, res) {
    try {
      const trend = await StockOverview.getStockTrend();
      res.json(trend);
    } catch (error) {
      console.error("Error fetching stock trend data:", error.message);
      res.status(500).json({ message: "Error fetching stock trend data." });
    }
  },

  async getRecentActivities(req, res) {
    try {
      const activities = await StockOverview.getRecentActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error.message);
      res.status(500).json({ message: "Error fetching recent activities." });
    }
  },

  async getLowStockWarning(req, res) {
    try {
      const lowStock = await StockOverview.getLowStockWarning();
      res.json(lowStock);
    } catch (error) {
      console.error("Error fetching low stock warning:", error.message);
      res.status(500).json({ message: "Error fetching low stock warning." });
    }
  },

  // Tambahkan metode baru untuk Main Stats
  async getMainStats(req, res) {
    try {
      const stats = await StockOverview.getMainStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching main stats:", error.message);
      res.status(500).json({ message: "Error fetching main stats." });
    }
  },

  async getStockTransactions(req, res) {
    const { productId } = req.params;
    const { warehouseId } = req.query; // Opsional: Filter berdasarkan gudang

    console.log(
      `[StockOverviewController] Request received for productId: ${productId}`
    );
    console.log(
      `[StockOverviewController] WarehouseId filter: ${warehouseId || "None"}`
    );

    try {
      if (!productId) {
        console.error("[StockOverviewController] Error: productId is missing.");
        return res.status(400).json({ message: "Product ID is required." });
      }

      console.log("[StockOverviewController] Fetching transactions...");
      const transactions = await StockOverview.getStockTransactions(
        productId,
        warehouseId || null
      );

      console.log(
        `[StockOverviewController] Retrieved ${transactions.length} transaction(s) for productId: ${productId}`
      );

      res.json(transactions);
    } catch (error) {
      console.error(
        "[StockOverviewController] Error fetching transactions:",
        error.message
      );
      res.status(500).json({ message: "Error fetching stock transactions." });
    }
  },
};

module.exports = StockOverviewController;
