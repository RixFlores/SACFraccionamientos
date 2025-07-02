const db = require('../database/connection');

const register = (req, res) => {
    const { Amount, Description, Concept, Notes, Status } = req.body;

    // Validación de campos
    if (!Amount || !Description || !Concept || !Status) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const insertSql = `
        INSERT INTO balance (
            UserId, 
            Amount, 
            Description, 
            Concept, 
            Notes, 
            Status, 
            CreatedOn, 
            LastModification
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Paso 1: Obtener todos los usuarios
    db.query("SELECT UserId FROM user", (err, users) => {
        if (err) {
            console.error("Error al obtener usuarios:", err);
            return res.status(500).json({ message: "Error al obtener usuarios" });
        }

        if (users.length === 0) {
            return res.status(404).json({ message: "No se encontraron usuarios" });
        }

        // Paso 2: Insertar un balance para cada usuario
        let insertCount = 0;
        let errors = [];

        users.forEach((user, index) => {
            db.query(
                insertSql,
                [user.UserId, Amount, Description, Concept, Notes, Status, currentDate, currentDate],
                (insertErr, result) => {
                    if (insertErr) {
                        errors.push({ userId: user.UserId, error: insertErr });
                    } else {
                        insertCount++;
                    }

                    // Cuando se procesen todos
                    if (index === users.length - 1) {
                        if (errors.length > 0) {
                            return res.status(500).json({
                                message: "Algunos balances no se pudieron registrar",
                                inserted: insertCount,
                                errors: errors
                            });
                        } else {
                            return res.status(201).json({
                                message: `Balances registrados exitosamente para ${insertCount} usuarios`
                            });
                        }
                    }
                }
            );
        });
    });
};

const balanceById = (req, res) => {
    const { UserId } = req.params;
    console.log("Obteniendo balance...", UserId);

    // Consulta SQL para obtener todos los usuarios
    const getBalanceSQL = `
        SELECT 
            RecordId, 
            UserId, 
            Amount, 
            Description, 
            Concept, 
            Notes, 
            Status, 
            CreatedOn, 
            LastModification
        FROM balance
        WHERE UserId = ?
    `;

    // Ejecutar la consulta SQL
    db.query(getBalanceSQL, [UserId], (err, result) => {
        if (err) {
            return res.status(400).send({
                status: "Error",
                message: "Error en get Balance"
            });
        }

        res.status(200).send({
            status: "Success",
            message: "Balance obtenido correctamente",
            data: result
        });
    });
};

const balance = (req, res) => {

    // Consulta SQL para obtener todos los usuarios
    const getBalanceSQL = `
        SELECT 
            b.RecordId, 
            b.UserId, 
            b.Amount, 
            b.Description, 
            b.Concept, 
            b.Notes, 
            b.Status, 
            b.CreatedOn, 
            b.LastModification,
            CONCAT(p.FirstName, ' ', p.LastName) AS UserFullName
        FROM balance b
        LEFT JOIN person p ON b.UserId = p.UserId 
    `;

    // Ejecutar la consulta SQL
    db.query(getBalanceSQL, (err, result) => {
        if (err) {
            return res.status(400).send({
                status: "Error",
                message: "Error en get Balance"
            });
        }

        res.status(200).send({
            status: "Success",
            message: "Balance obtenido correctamente",
            data: result
        });
    });
};

const updateStatus = (req, res) => {
    const { cuotaId, Status } = req.params;

    if (!cuotaId || !Status) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const sql = `UPDATE balance SET Status = ? WHERE RecordId = ?`;

    db.query(sql, [Status, cuotaId], (err, result) => {
        if (err) {
            console.error("Error al actualizar el estado de la cuota:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cuota no encontrada" });
        }

        res.status(200).json({ message: "Cuota actualizado exitosamente" });
    });
};

const deleteBalance = (req, res) => {
    const { RecordId } = req.params;

    if (!RecordId) {
        return res.status(400).json({ message: "Falta el ID de la cuota" });
    }

    const sql = `DELETE FROM balance WHERE RecordId = ?`;

    db.query(sql, [RecordId], (err, result) => {
        if (err) {
            console.error("Error al eliminar la cuota:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cuota no encontrada" });
        }

        res.status(200).json({ message: "Cuota eliminada exitosamente" });
    });
};

const registerForOne = (req, res) => {
    const { Amount, Description, Concept, Status } = req.body;
    const { UserId } = req.params;

    console.log()
    // Validación de campos
    if (!Amount || !Description || !Concept || !Status) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const insertSql = `
        INSERT INTO balance (
            UserId, 
            Amount, 
            Description, 
            Concept, 
            Notes, 
            Status, 
            CreatedOn, 
            LastModification
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        insertSql,
        [UserId, Amount, Description, Concept, '', Status, currentDate, currentDate],
        (insertErr, result) => {
            if (insertErr) {
                console.error("Error al eliminar la cuota:", insertErr);
                return res.status(500).json({ message: "Error interno del servidor" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Cuota no encontrada" });
            }

            res.status(200).json({ message: "Cuota creada exitosamente" });
        }
    );
};

const balanceByIncome = (req, res) => {
    const { Description } = req.params;
    const { Concept } = req.params;
    const { Amount } = req.params;
    const { UserId } = req.params;
    const { Status } = req.params;

    console.log("Obteniendo balance...", UserId);

    // Consulta SQL para obtener todos los usuarios
    /*     const getBalanceSQL = `
            SELECT 
                RecordId, 
                UserId, 
                Amount, 
                Description, 
                Concept, 
                Notes, 
                Status, 
                CreatedOn, 
                LastModification
            FROM balance
            WHERE UserId = ?
        `;
     */
    const sql = `UPDATE balance SET Status = ? 
    WHERE UserId = ?
    AND Description = ?
    AND Concept = ?
    AND Amount = ?    
    `;


    // Ejecutar la consulta SQL
    db.query(sql, [Status, UserId, Description, Concept, Amount], (err, result) => {
        if (err) {
            return res.status(400).send({
                status: "Error",
                message: "Error en actualizar Balance"
            });
        }

        res.status(200).send({
            status: "Success",
            message: "Balance obtenido correctamente",
            data: result
        });
    });
};


module.exports = {
    register,
    balance,
    balanceById,
    updateStatus,
    deleteBalance,
    registerForOne,
    balanceByIncome
}