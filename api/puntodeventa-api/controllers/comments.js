const db = require('../database/connection');

const register = (req, res) => {
    console.log("REGISTRO DE COMENTARIO", req.body);
    const { UserId, Title, Message } = req.body;

    if (!UserId || !Title || !Message) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `INSERT INTO comments (
        UserId, 
        Title, 
        Message,
        CreatedOn) 
    VALUES (?, ?, ?, ?)`;

    db.query(sql, [UserId, Title, Message, currentDate], (err, result) => {
        if (err) {
            console.error("Error al registrar factura:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        res.status(201).json({
            message: "Comentarios enviados exitosamente",
        });
    });
};

const comments = (req, res) => {
    // Consulta SQL para obtener todos los usuarios
    const getVisitsSQL = `
        SELECT 
            c.RecordId,
            c.Title,
            c.Message,
            c.CreatedOn,
            CONCAT(p.FirstName, ' ', p.LastName) AS UserFullName
        FROM comments c
        LEFT JOIN person p ON c.UserId = p.UserId 
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

const deleteComments = (req, res) => {
    const { CommentId } = req.params;

    if (!CommentId) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const sql = `DELETE FROM comments WHERE RecordId = ?`;

    db.query(sql, [CommentId], (err, result) => {
        if (err) {
            console.error("Error al eliminar el comentario:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        res.status(200).json({
            message: "Visita eliminada exitosamente",
        });
    });
};

module.exports = {
    register,
    comments,
    deleteComments,
}