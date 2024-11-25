const express = require("express");
const KendaraanController = require("../controllers/kendaraanController");

const router = express.Router();

router.get("/", KendaraanController.getAll);
router.post("/", KendaraanController.create);

module.exports = router;
