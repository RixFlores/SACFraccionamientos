const db = require('../database/connection');

const register = (req, res) => {
    const { Name, UserId, Status, Vehicle, NumberOfVisitors, RegisteredBy } = req.body;
    console.log("VISITAS", req.body)
    if (!Name || !UserId || !Date || !Status || !Vehicle || !NumberOfVisitors || !RegisteredBy) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `INSERT INTO visits (Name, UserId, Date, Status, Vehicle, NumberOfVisitors, RegisteredBy) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [Name, UserId, currentDate, Status, Vehicle, NumberOfVisitors, RegisteredBy], (err, result) => {
        if (err) {
            console.error("Error al registrar factura:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        res.status(201).json({
            message: "Factura registrada exitosamente",
            Name,
            UserId,
            Status,
            Vehicle,
            NumberOfVisitors,
            RegisteredBy,
            Date: currentDate
        });
    });
};


const visits = (req, res) => {
    // Consulta SQL para obtener todos los usuarios
    const getVisitsSQL = `
        SELECT 
        i.VisitorId, 
        i.Name, 
        i.Date, 
        i.Status,
        i.Vehicle,
        i.NumberOfVisitors,
        i.RegisteredBy,
        CONCAT(u.FirstName, ' ', u.LastName) AS UserFullName,
        CONCAT(r.FirstName, ' ', r.LastName) AS RegisteredByFullName
        FROM visits i
        LEFT JOIN person u ON i.UserId = u.UserId
        LEFT JOIN person r ON i.RegisteredBy = r.UserId
    `;

    // Ejecutar la consulta SQL
    db.query(getVisitsSQL, (err, result) => {
        if (err) {
            return res.status(400).send({
                status: "Error",
                message: "Error en get visits"
            });
        }

        // Devolver los resultados
        return res.status(200).send({
            result,
        });
    });
};

const deleteVisits = (req, res) => {
    const { VisitorId } = req.params;

    if (!VisitorId) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const sql = `DELETE FROM visits WHERE VisitorId = ?`;

    db.query(sql, [VisitorId], (err, result) => {
        if (err) {
            console.error("Error al eliminar visita:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        res.status(200).json({
            message: "Visita eliminada exitosamente",
            VisitorId
        });
    });
};

module.exports = {
    register,
    visits,
    deleteVisits,
}