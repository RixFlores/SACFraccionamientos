const express = require("express");
const router = express.Router();
const multer = require("multer");
const balanceController = require("../controllers/balance");
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
router.post("/register", balanceController.register);  // Registro de usuario
router.get("/balance/:UserId", balanceController.balance);  // Registro de usuario
/* router.put("/status/:billId/:Status/:ApprovedBy", balanceController.updateStatus);  // Registro de usuario
router.delete("/delete/:billId", balanceController.deletebalance);  // Registro de usuario
 */
module.exports = router;
