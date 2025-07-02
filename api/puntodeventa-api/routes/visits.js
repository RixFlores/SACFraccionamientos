const express = require("express");
const router = express.Router();
const multer = require("multer");
const visitsController = require("../controllers/visits");
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
router.post("/register", visitsController.register);  // Registro de usuario
router.get("/visits", visitsController.visits);          // Inicio de sesión
router.delete("/delete/:VisitorId", visitsController.deleteVisits);  // Eliminar visita por ID
router.put("/status/:visitId/:Status/", visitsController.updateStatus);  // Registro de usuario

/*
router.get("/profile/:id", check.auth, visitsController.profile);  // Obtener perfil de usuario por ID
router.put("/update", check.auth, visitsController.update);        // Actualizar perfil
router.put("/updateUser/:id", check.auth, visitsController.updateUserCard);  // Actualizar datos de usuario por ID
router.get("/avatar/:file", check.auth, visitsController.avatar); // Obtener avatar de usuario
router.delete("/deleteUser/:userId", check.auth, visitsController.deleteUser); // Eliminar usuario por ID
 */
module.exports = router;
