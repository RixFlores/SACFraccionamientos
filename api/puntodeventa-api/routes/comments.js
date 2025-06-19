const express = require("express");
const router = express.Router();
const multer = require("multer");
const commentsController = require("../controllers/comments");
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
router.post("/register", commentsController.register);  // Registro de usuario
router.get("/comments", commentsController.comments);  // Registro de usuario
router.delete("/deleteComments/:CommentId", commentsController.deleteComments);  // Registro de usuario

module.exports = router;
