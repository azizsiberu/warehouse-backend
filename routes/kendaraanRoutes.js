const express = require("express");
const KendaraanController = require("../controllers/kendaraanController");

const router = express.Router();

router.get("/", KendaraanController.getAll);
router.post("/", KendaraanController.create);

// Route untuk memperbarui data kendaraan berdasarkan ID
router.put("/:id", KendaraanController.update);

// Route untuk menonaktifkan data kendaraan berdasarkan ID
router.delete("/:id", KendaraanController.deactivate);

module.exports = router;
