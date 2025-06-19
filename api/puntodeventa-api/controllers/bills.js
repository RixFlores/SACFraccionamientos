const db = require('../database/connection');

const register = (req, res) => {
    const { description, amount, UserId, Status, RegisteredBy, ApprovedBy } = req.body;

    if (!description || !amount || !UserId || !Status || !RegisteredBy) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `INSERT INTO bills (description, amount, UserId, Date, Status, RegisteredBy, ApprovedBy) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [description, amount, UserId, currentDate, Status, RegisteredBy, ApprovedBy], (err, result) => {
        if (err) {
            console.error("Error al registrar factura:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        res.status(201).json({
            message: "Factura registrada exitosamente",
            billId: result.insertId,
            description,
            amount,
            UserId,
            Status,
            RegisteredBy,
            ApprovedBy,
            Date: currentDate
        });
    });
};


const bills = (req, res) => {
  console.log("ENTRE A BILLS");

  try {
    const { fechaInicio, fechaFin } = req.query;

    let query = `
      SELECT b.*, 
             CONCAT(p1.FirstName, ' ', p1.LastName) AS UserFullName,
             CONCAT(p2.FirstName, ' ', p2.LastName) AS ApprovedByFullName
      FROM fraccionamiento_agaves.bills b
      LEFT JOIN fraccionamiento_agaves.person p1 ON b.UserId = p1.UserId
      LEFT JOIN fraccionamiento_agaves.person p2 ON b.ApprovedBy = p2.UserId
    `;

    const params = [];

    if (fechaInicio && fechaFin) {
      query += ` WHERE DATE(b.Date) BETWEEN ? AND ?`;
      params.push(fechaInicio, fechaFin);
    } else if (fechaInicio) {
      query += ` WHERE DATE(b.Date) >= ?`;
      params.push(fechaInicio);
    } else if (fechaFin) {
      query += ` WHERE DATE(b.Date) <= ?`;
      params.push(fechaFin);
    }

    query += ` ORDER BY b.Date DESC`;

    db.query(query, params, (err, result) => {
      if (err) {
        console.error("Error en la consulta SQL:", err);
        return res.status(500).json({ msg: 'Error en la consulta' });
      }
      res.status(200).json({ result });
    });

  } catch (error) {
    console.error("Error general:", error);
    return res.status(500).json({ msg: 'Error interno del servidor' });
  }
};



/* 
const bills = (req, res) => {
    // Consulta SQL para obtener todos los usuarios
    const getBillsSQL = `
        SELECT 
            i.billId, 
            i.description, 
            i.Amount,
            i.UserId,
            i.Date,
            i.Status,
            i.RegisteredBy,
            i.ApprovedBy,
            CONCAT(u.FirstName, ' ', u.LastName) AS UserFullName,
            CONCAT(a.FirstName, ' ', a.LastName) AS ApprovedByFullName
        FROM bills i
        LEFT JOIN person u ON i.UserId = u.UserId
        LEFT JOIN person a ON i.ApprovedBy = a.UserId;
    `;

    // Ejecutar la consulta SQL
    db.query(getBillsSQL, (err, result) => {
        if (err) {
            return res.status(400).send({
                status: "Error",
                message: "Error en get bills"
            });
        }

        // Devolver los resultados
        return res.status(200).send({
            result,
        });
    }); 
};
*/

const deleteBills = (req, res) => {
    const { billId } = req.params;
    console.log("ID de la factura a eliminar:", billId);

    if (!billId) {
        return res.status(400).json({ message: "Falta el ID de la factura" });
    }

    const sql = `DELETE FROM bills WHERE billId = ?`;

    db.query(sql, [billId], (err, result) => {
        if (err) {
            console.error("Error al eliminar factura:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        res.status(200).json({ message: "Factura eliminada exitosamente" });
    });
};

const updateStatus = (req, res) => {
    const { billId, Status, ApprovedBy } = req.params;

    if (!billId || !Status) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const sql = `UPDATE bills SET Status = ?, ApprovedBy = ? WHERE billId = ?`;

    db.query(sql, [Status, ApprovedBy, billId], (err, result) => {
        if (err) {
            console.error("Error al actualizar el estado del gasto:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Gasto no encontrada" });
        }

        res.status(200).json({ message: "Gasto actualizado exitosamente" });
    });
};



module.exports = {
    register,
    bills,
    deleteBills,
    updateStatus,
}