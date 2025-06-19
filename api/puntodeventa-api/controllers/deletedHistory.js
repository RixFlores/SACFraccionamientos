const db = require('../database/connection');

const register = (req, res) => {
    const { Description, Module, DeletedBy, CreatedBy, CreatedOn, Notes } = req.body;
    
    console.log("deleted history", req.body)
    if ( !Description || !Module || !DeletedBy || !CreatedBy || !CreatedOn) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `INSERT INTO 
    deletedhistory ( 
        Description, 
        Module, 
        DeletedBy, 
        CreatedBy, 
        CreatedOn, 
        DeletedOn, 
        Notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [Description, Module, DeletedBy, CreatedBy, CreatedOn, currentDate, Notes], (err, result) => {
        if (err) {
            console.error("Error al registrar factura:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        res.status(201).json({
            message: "Factura registrada exitosamente"
        });
    });
};

const deletedHistory = (req, res) => {
    // Consulta SQL para obtener todos los usuarios
    const getDeletedHistorySQL = `
        SELECT RecordId, Description, Module, DeletedBy, CreatedBy, CreatedOn, DeletedOn, Notes
        FROM visits
    `;

    // Ejecutar la consulta SQL
    db.query(getDeletedHistorySQL, (err, result) => {
        if (err) {
            return res.status(400).send({
                status: "Error",
                message: "Error en get deleted history"
            });
        }

        res.status(200).send({
            status: "Success",
            message: "deleted history obtenidas correctamente",
            data: result
        });
    });
};

module.exports = {
    register,
    deletedHistory,
}