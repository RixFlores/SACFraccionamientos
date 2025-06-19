const express = require("express");
const router = express.Router();
const multer = require("multer");
const incomesController = require("../controllers/incomes");
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
router.post("/register", incomesController.register);  // Registro de usuario
router.get("/incomes", incomesController.incomes);  // Registro de usuario
router.put("/status/:IncomeId/:Status/:ApprovedBy", incomesController.updateStatus);  // Registro de usuario
router.delete("/delete/:IncomeId", incomesController.deleteIncomes);  // Registro de usuario

module.exports = router;
