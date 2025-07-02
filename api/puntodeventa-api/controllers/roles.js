const db = require('../database/connection');

// REGISTRAR NUEVO ROL
const register = (req, res) => {
    const { Name } = req.body;

    if (!Name) {
        return res.status(400).json({ message: "Falta el campo Name" });
    }

    const sql = `INSERT INTO roles (Name) VALUES (?)`;
    db.query(sql, [Name], (err, result) => {
        if (err) {
            console.error("Error al registrar rol:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        return res.status(201).json({
            message: "Rol registrado exitosamente",
            RoleId: result.insertId,
            Name
        });
    });
};

const registerClaims = (req, res) => {
    const { Name, RoleId } = req.body;

    if (!Name || !RoleId) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    // Verifica si ya existe ese claim para ese rol
    const checkSQL = `SELECT * FROM claims WHERE Name = ? AND RoleId = ?`;
    db.query(checkSQL, [Name, RoleId], (err, rows) => {
        if (err) {
            console.error("Error al verificar claim:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        if (rows.length > 0) {
            return res.status(409).json({ message: "El claim ya existe para este rol" });
        }

        const sql = `INSERT INTO claims (Name, RoleId) VALUES (?, ?)`;
        db.query(sql, [Name, RoleId], (err, result) => {
            if (err) {
                console.error("Error al registrar claim:", err);
                return res.status(500).json({ message: "Error interno del servidor" });
            }

            return res.status(201).json({
                message: "Claim registrado exitosamente",
                ClaimId: result.insertId,
                Name,
                RoleId
            });
        });
    });
};



// OBTENER TODOS LOS ROLES
const roles = (req, res) => {
    const sql = `SELECT * FROM roles`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error al obtener roles:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        return res.status(200).json({ roles: result });
    });
};

// OBTENER UN ROL POR ID
const role = (req, res) => {
    const { roleId } = req.params;

    const sql = `SELECT * FROM roles WHERE RoleId = ?`;
    db.query(sql, [roleId], (err, result) => {
        if (err) {
            console.error("Error al obtener rol:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Rol no encontrado" });
        }

        return res.status(200).json({ role: result[0] });
    });
};

// ACTUALIZAR UN ROL
const update = (req, res) => {
    const { roleId } = req.params;
    const { Name } = req.body;

    if (!Name) {
        return res.status(400).json({ message: "Falta el campo Name" });
    }

    const sql = `UPDATE roles SET Name = ? WHERE RoleId = ?`;
    db.query(sql, [Name, roleId], (err, result) => {
        if (err) {
            console.error("Error al actualizar rol:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        return res.status(200).json({
            message: "Rol actualizado exitosamente",
            RoleId: roleId,
            Name
        });
    });
};

// ELIMINAR UN ROL (validando si tiene claims asociados)
/* const deleteRole = (req, res) => {
    const { roleId } = req.params;

    const checkClaimsSQL = `SELECT COUNT(*) AS total FROM claims WHERE RoleId = ?`;
    db.query(checkClaimsSQL, [roleId], (err, result) => {
        if (err) {
            console.error("Error al validar claims:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        if (result[0].total > 0) {
            return res.status(400).json({ message: "No se puede eliminar el rol porque tiene claims asociados" });
        }

        const deleteSQL = `DELETE FROM roles WHERE RoleId = ?`;
        db.query(deleteSQL, [roleId], (err, result) => {
            if (err) {
                console.error("Error al eliminar rol:", err);
                return res.status(500).json({ message: "Error interno del servidor" });
            }

            return res.status(200).json({
                message: "Rol eliminado exitosamente",
                RoleId: roleId
            });
        });
    });
}; */

const deleteRole = (req, res) => {
    const { roleId } = req.params;

    const deleteClaimsSQL = `DELETE FROM claims WHERE RoleId = ?`;
    const deleteRoleSQL = `DELETE FROM roles WHERE RoleId = ?`;

    // Primero eliminar los claims
    db.query(deleteClaimsSQL, [roleId], (err, resultClaims) => {
        if (err) {
            console.error("Error al eliminar claims asociados:", err);
            return res.status(500).json({ message: "Error al eliminar claims asociados" });
        }

        // Luego eliminar el rol
        db.query(deleteRoleSQL, [roleId], (err, resultRole) => {
            if (err) {
                console.error("Error al eliminar rol:", err);
                return res.status(500).json({ message: "Error al eliminar rol" });
            }

            return res.status(200).json({
                message: "Rol y claims asociados eliminados exitosamente",
                RoleId: roleId
            });
        });
    });
};


// OBTENER CLAIMS POR ROLE ID
const claimsByRole = (req, res) => {
    const { roleId } = req.params;
    console.log("ROLE ID", roleId)

    const sql = `
        SELECT c.ClaimId, c.Name AS ClaimName, c.RoleId, r.Name AS RoleName
        FROM claims c
        LEFT JOIN roles r ON c.RoleId = r.RoleId
        WHERE c.RoleId = ?
    `;

    db.query(sql, [roleId], (err, result) => {
        if (err) {
            console.error("Error al obtener claims por rol:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        return res.status(200).json({
            roleId,
            claims: result
        });
    });
};

const deleteClaim = (req, res) => {
    const { claimId } = req.params;

    const sql = `DELETE FROM claims WHERE ClaimId = ?`;

    db.query(sql, [claimId], (err, result) => {
        if (err) {
            console.error("Error al eliminar claim:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        return res.status(200).json({
            message: "Claim eliminado exitosamente",
            ClaimId: claimId
        });
    });
};

// EXPORTACIÓN
module.exports = {
    register,
    registerClaims,
    roles,
    role,
    update,
    delete: deleteRole,
    claimsByRole,
    deleteClaim
};
