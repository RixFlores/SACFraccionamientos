const express = require("express");
const router = express.Router();
const multer = require("multer");
const billsController = require("../controllers/bills");
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
router.post("/register", billsController.register);  // Registro de usuario
router.get("/bills", billsController.bills);  // Registro de usuario
router.put("/status/:billId/:Status/:ApprovedBy", billsController.updateStatus);  // Registro de usuario
router.delete("/delete/:billId", billsController.deleteBills);  // Registro de usuario

module.exports = router;
