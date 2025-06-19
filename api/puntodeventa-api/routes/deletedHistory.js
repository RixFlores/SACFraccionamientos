const express = require("express");
const router = express.Router();
const multer = require("multer");
const deletedHistoryController = require("../controllers/deletedHistory");
const check = require("../middlewares/auth");


const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, './Images/categorias/');
    },
    filename(req, file, cb) {
        cb(null, "categorias" + Date.now() + file.originalname);
    }
});

const uploads = multer({ storage: storage });

// Rutas
router.post("/register", deletedHistoryController.register);  // Registro de usuario
router.get("/deletedHistory", deletedHistoryController.deletedHistory);  // Registro de usuario

module.exports = router;
