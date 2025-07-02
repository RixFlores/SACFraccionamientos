const db = require('../database/connection');


const register = (req, res) => {
    const { Description, UserId } = req.body;

    if (!Description || !UserId) {
        return res.status(400).json({ message: "Faltan el campos" });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `INSERT INTO notifications (Description, UserId, Date, Status) VALUES (?, ?, ?, ?)`;
    db.query(sql, [Description, UserId, currentDate, 'N'], (err, result) => {
        if (err) {
            console.error("Error al registrar la notificacion:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        return res.status(201).json({
            message: "Notificacion registrada exitosamente",
        });
    });
};


const notifications = (req, res) => {
    const sql = `SELECT * FROM notifications`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error al obtener notificaciones:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        return res.status(200).json({ data: result });
    });
};

const notificationsById = (req, res) => {
    const { UserId } = req.params;
    console.log("USER", UserId)
    const sql = `SELECT * FROM notifications WHERE UserId = ?`;

    db.query(sql, [UserId], (err, result) => {
        if (err) {
            console.error("Error al obtener notificaciones:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        return res.status(200).json({ data: result });
    });
};


const update = (req, res) => {
    const { NotificationId } = req.params;
    const { Status } = req.body;
    console.log("NotificationId", NotificationId)
    console.log("Status", Status)

    if (!NotificationId || !Status) {
        return res.status(400).json({ message: "Faltan campos" });
    }

    const sql = `UPDATE notifications SET Status = ? WHERE NotificationId = ?`;
    db.query(sql, [Status, NotificationId], (err, result) => {
        if (err) {
            console.error("Error al actualizar la notificacion:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        return res.status(200).json({
            message: "Notificacion actualizada exitosamente",
        });
    });
};

const deleteNotifications = (req, res) => {
    const { notificationId } = req.params;

    const deleteFinesSQL = `DELETE FROM notifications WHERE NotificationId = ?`;

    // Primero eliminar los claims
    db.query(deleteFinesSQL, [notificationId], (err, resultClaims) => {
        if (err) {
            console.error("Error al eliminar la notification", err);
            return res.status(500).json({ message: "Error al eliminar la notification" });
        }
        return res.status(200).json({
            message: "Multa eliminada correctamente"
        });
    });
};


// EXPORTACIÓN
module.exports = {
    register,
    notifications,
    notificationsById,
    update,
    delete: deleteNotifications
};

