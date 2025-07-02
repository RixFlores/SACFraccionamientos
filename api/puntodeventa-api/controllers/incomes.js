const db = require('../database/connection');


const register = (req, res) => {
    const { Description, Amount, UserId, Status, RegisteredBy, Concept } = req.body;
    if (!Description || !Amount || !UserId || !Status || !RegisteredBy || !Concept) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `INSERT INTO incomes (Description, Amount, UserId, Date, Status, RegisteredBy, Concept) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [Description, Amount, UserId, currentDate, Status, RegisteredBy, Concept], (err, result) => {
        if (err) {
            console.error("Error al registrar factura:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        res.status(201).json({
            message: "Factura registrada exitosamente",
            billId: result.insertId,
            Description,
            Amount,
            UserId,
            Date: currentDate,
            Status,
            RegisteredBy,
            Concept
        });
    });
};


const incomes = (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        let query = `
            SELECT 
                i.IncomeId, 
                i.Description, 
                i.Amount, 
                i.UserId, 
                i.Date, 
                i.Status, 
                i.RegisteredBy,
                i.Concept,
                i.ApprovedBy,
                CONCAT(u.FirstName, ' ', u.LastName) AS UserFullName,
                CONCAT(r.FirstName, ' ', r.LastName) AS RegisteredByFullName,
                CONCAT(a.FirstName, ' ', a.LastName) AS ApprovedByFullName
            FROM incomes i
            LEFT JOIN person u ON i.UserId = u.UserId
            LEFT JOIN person r ON i.RegisteredBy = r.UserId        
            LEFT JOIN person a ON i.ApprovedBy = a.UserId
            `;

        const params = [];

        if (fechaInicio && fechaFin) {
            query += ` WHERE DATE(i.Date) BETWEEN ? AND ?`;
            params.push(fechaInicio, fechaFin);
        } else if (fechaInicio) {
            query += ` WHERE DATE(i.Date) >= ?`;
            params.push(fechaInicio);
        } else if (fechaFin) {
            query += ` WHERE DATE(i.Date) <= ?`;
            params.push(fechaFin);
        }

        query += ` ORDER BY i.Date DESC`;

        db.query(query, params, (err, result) => {
            if (err) {
                console.error("Error en la consulta SQL:", err);
                return res.status(500).json({ status: "Error", message: "Error en get incomes" });
            }

            return res.status(200).json({ result });
        });

    } catch (error) {
        console.error("Error general:", error);
        return res.status(500).json({ status: "Error", message: "Error interno del servidor" });
    }
};

const deleteIncomes = (req, res) => {
    const { IncomeId } = req.params;

    if (!IncomeId) {
        return res.status(400).json({ message: "Falta el ID de la factura" });
    }

    const sql = `DELETE FROM incomes WHERE IncomeId = ?`;

    db.query(sql, [IncomeId], (err, result) => {
        if (err) {
            console.error("Error al eliminar factura:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        res.status(200).json({ message: "Factura eliminada exitosamente" });
    });
}

const updateStatus = (req, res) => {
    const { IncomeId, Status, ApprovedBy } = req.params;

    if (!IncomeId || !Status) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const sql = `UPDATE incomes SET Status = ?, ApprovedBy = ? WHERE IncomeId = ?`;

    db.query(sql, [Status, ApprovedBy, IncomeId], (err, result) => {
        if (err) {
            console.error("Error al actualizar el estado de la factura:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        res.status(200).json({ message: "Estado de la factura actualizado exitosamente" });
    });
};


module.exports = {
    register,
    incomes,
    deleteIncomes,
    updateStatus,
}