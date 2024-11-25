//path: routes/customerRoutes.js
const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.get("/", customerController.getAll); // GET all customers
router.get("/:id", customerController.getById); // GET customer by ID
router.post("/", customerController.create); // CREATE new customer
router.put("/:id", customerController.update); // UPDATE customer by ID
router.delete("/:id", customerController.delete); // DELETE customer by ID

module.exports = router;
