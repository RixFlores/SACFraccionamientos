const express = require("express");
const router = express.Router();
const multer = require("multer");
const userController = require("../controllers/user");
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
router.get("/userTest", userController.test);
router.post("/register", userController.register);  // Registro de usuario
router.post("/login", userController.login);          // Inicio de sesión
router.get("/users", userController.getUsers);      // Obtener lista de usuarios
router.get("/user/:id", userController.getUser);      // Obtener lista de usuarios
router.delete("/delete/:id", userController.deleteUser);      // Obtener lista de usuarios
router.put("/update/:id", userController.updateUser);
router.get("/fullUser/:id", userController.getFullUser);      // Obtener lista de usuarios


/*
router.get("/profile/:id", check.auth, userController.profile);  // Obtener perfil de usuario por ID
router.put("/update", check.auth, userController.update);        // Actualizar perfil
router.put("/updateUser/:id", check.auth, userController.updateUserCard);  // Actualizar datos de usuario por ID
router.get("/avatar/:file", check.auth, userController.avatar); // Obtener avatar de usuario
router.delete("/deleteUser/:userId", check.auth, userController.deleteUser); // Eliminar usuario por ID
 */
module.exports = router;
