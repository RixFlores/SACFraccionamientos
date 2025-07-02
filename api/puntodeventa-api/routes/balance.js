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
router.post("/registerForOne/:UserId", balanceController.registerForOne);  // Registro de usuario
router.get("/balanceId/:UserId", balanceController.balanceById);  // Registro de usuario

router.put("/balanceByIncome/:Description/:Concept/:Amount/:UserId/:Status", balanceController.balanceByIncome);  // Registro de usuario

router.get("/balance", balanceController.balance);  // Registro de usuario
router.put("/status/:cuotaId/:Status/", balanceController.updateStatus);  // Registro de usuario
router.delete("/delete/:RecordId", balanceController.deleteBalance);  // Registro de usuario

/* router.put("/status/:billId/:Status/:ApprovedBy", balanceController.updateStatus);  // Registro de usuario
router.delete("/delete/:billId", balanceController.deletebalance);  // Registro de usuario
 */
module.exports = router;
