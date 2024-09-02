// path: routes/itemRoutes.js

const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");
const authenticateToken = require("../middlewares/authMiddleware");

// CRUD routes for items
router.post("/items", authenticateToken, itemController.createItem);
router.get("/items", authenticateToken, itemController.getAllItems);
router.get("/items/:id", authenticateToken, itemController.getItemById);
router.put("/items/:id", authenticateToken, itemController.updateItem);
router.delete("/items/:id", authenticateToken, itemController.deleteItem);

module.exports = router;
