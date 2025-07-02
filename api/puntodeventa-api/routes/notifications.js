const express = require("express");
const router = express.Router();
const multer = require("multer");
const notificationsController = require("../controllers/notifications");
const check = require("../middlewares/auth");


// Rutas
router.post("/register", notificationsController.register);
router.get("/", notificationsController.notifications);
router.get("/:UserId", notificationsController.notificationsById);
router.put("/:NotificationId", notificationsController.update);
router.delete("/:notificationId", notificationsController.delete);

module.exports = router;