const db = require('../database/connection');


const register = (req, res) => {
    const { Name, Amount } = req.body;

    if (!Name || !Amount) {
        return res.status(400).json({ message: "Faltan el campos" });
    }

    const sql = `INSERT INTO fines (Name, Amount) VALUES (?, ?)`;
    db.query(sql, [Name, Amount], (err, result) => {
        if (err) {
            console.error("Error al registrar la multa:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        return res.status(201).json({
            message: "Multa registrada exitosamente",
        });
    });
};


const fines = (req, res) => {
    const sql = `SELECT * FROM fines`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error al obtener multas:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        return res.status(200).json({ fines: result });
    });
};

const update = (req, res) => {
    const { fineId } = req.params;
    const { Name } = req.body;
    const { Amount } = req.body;

    if (!Name || !Amount) {
        return res.status(400).json({ message: "Faltan campos" });
    }

    const sql = `UPDATE fines SET Name = ?, Amount = ? WHERE fineId = ?`;
    db.query(sql, [Name, Amount, fineId], (err, result) => {
        if (err) {
            console.error("Error al actualizar la multa:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        return res.status(200).json({
            message: "Multa actualizada exitosamente",
        });
    });
};

const deleteFine = (req, res) => {
    const { fineId } = req.params;

    const deleteFinesSQL = `DELETE FROM fines WHERE FineId = ?`;

    // Primero eliminar los claims
    db.query(deleteFinesSQL, [fineId], (err, resultClaims) => {
        if (err) {
            console.error("Error al eliminar multa", err);
            return res.status(500).json({ message: "Error al eliminar multa" });
        }
        return res.status(200).json({
            message: "Multa eliminada correctamente"
        });
    });
};


// EXPORTACIÓN
module.exports = {
    register,
    fines,
    update,
    delete: deleteFine
};

