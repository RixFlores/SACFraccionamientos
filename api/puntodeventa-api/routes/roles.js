const express = require("express");
const router = express.Router();
const multer = require("multer");
const rolesController = require("../controllers/roles");
const check = require("../middlewares/auth");


// Rutas
router.post("/register", rolesController.register);
router.get("/roles", rolesController.roles);
router.get("/roles/:roleId", rolesController.role);
router.put("/roles/:roleId", rolesController.update);
router.delete("/roles/:roleId", rolesController.delete);
router.get("/claims/by-role/:roleId", rolesController.claimsByRole);


router.post("/registerClaims", rolesController.registerClaims);
router.delete("/deleteClaim/:claimId", rolesController.deleteClaim);

module.exports = router;
