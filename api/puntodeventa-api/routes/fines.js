const express = require("express");
const router = express.Router();
const multer = require("multer");
const finesController = require("../controllers/fines");
const check = require("../middlewares/auth");


// Rutas
router.post("/register", finesController.register);
router.get("/fines", finesController.fines);
router.put("/fines/:fineId", finesController.update);
router.delete("/:fineId", finesController.delete);

module.exports = router;
