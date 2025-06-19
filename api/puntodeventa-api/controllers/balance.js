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


const balance = (req, res) => {
    const { UserId } = req.params;
    console.log("Obteniendo balance...",UserId);

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

module.exports = {
    register,
    balance,
}