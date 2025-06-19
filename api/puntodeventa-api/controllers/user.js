const bcrypt = require("bcrypt");
/* const jwt = require("../services/jwt"); */
const fs = require("fs");
const path = require("path");
const db = require('../database/connection');
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "clave_refresh";
const ACCESS_TOKEN_EXPIRES_IN = "15m"; // ejemplo: 15 minutos
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // ejemplo: 7 días

const test = (req, res) => {
    return res.status(200).json({
        message: "Mensaje de prueba user enviado correctmanete"
    });
}

const register = async (req, res) => {
    const {
        Email,
        Password,
        RoleId = "user",
        FirstName,
        LastName,
        HouseNumber,
        Residents,
        Phone,
        Debtor
    } = req.body;
    console.log("BODY", req.body)

    if (!Email || !Password || !RoleId || !FirstName || !LastName || !HouseNumber || !Residents || !Phone || !Debtor) {
        return res.status(400).json({
            status: "Error",
            message: "Registro incompleto. Verifica los campos obligatorios."
        });
    }

    try {
        // Verificar si el email ya existe
        const [existingUser] = await db.promise().query(
            `SELECT * FROM user WHERE Email = ?`,
            [Email.toLowerCase()]
        );

        if (existingUser.length > 0) {
            return res.status(200).json({
                status: "Success",
                message: "El correo electrónico ya está en uso"
            });
        }

        const hashedPassword = await bcrypt.hash(Password, saltRounds);

        // Insertar en tabla User
        const [userResult] = await db.promise().query(
            `INSERT INTO user (Email, RoleId, Password, UserName, Debtor) VALUES (?, ?, ?, ?, ?)`,
            [Email.toLowerCase(), RoleId, hashedPassword, '']
        );

        const UserId = userResult.insertId;

        // Insertar en tabla Person
        await db.promise().query(
            `INSERT INTO person (UserId, FirstName, LastName, HouseNumber, Residents, Phone)
            VALUES (?, ?, ?, ?, ?)`,
            [UserId, FirstName, LastName, HouseNumber, Residents, Phone]
        );

        return res.status(201).json({
            status: "Success",
            message: "Usuario y persona registrados correctamente",
            user: {
                UserId,
                Email,
                Password,
                RoleId,
                FirstName,
                LastName,
                HouseNumber,
                Residents,
                Phone,
                Debtor
            }
        });

    } catch (err) {
        console.error("Error en registro:", err);
        return res.status(500).json({
            status: "Error",
            message: "Error en el servidor al registrar"
        });
    }
};


const login = async (req, res) => {
    console.log("Login");

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            status: "Error",
            message: "Falta correo o contraseña"
        });
    }

    const sql = `SELECT * FROM user WHERE Email = ?`;

    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).send({
                status: "Error",
                message: "Error al buscar el usuario"
            });
        }

        if (results.length === 0) {
            return res.status(404).send({
                status: "Error",
                message: "El usuario no existe"
            });
        }

        const user = results[0];

        const sql2 = `SELECT * FROM person WHERE UserId = ?`;

        db.query(sql2, [user.UserId], async (err, personResults) => {
            if (err) {
                return res.status(500).send({
                    status: "Error",
                    message: "Error al buscar a la persona"
                });
            }

            if (personResults.length === 0) {
                return res.status(404).send({
                    status: "Error",
                    message: "La persona no existe"
                });
            }

            const person = personResults[0];

            console.log("DATOS DEL USUARIO", user);
            console.log("DATOS DEL PERSON", person);

            const validPassword = await bcrypt.compare(password, user.Password);

            if (!validPassword) {
                return res.status(400).send({
                    status: "Error",
                    message: "Contraseña incorrecta"
                });
            }

            // Crear access token
            const accessToken = jwt.sign(
                {
                    id: user.UserId,
                    email: user.Email,
                    rol: user.RoleId,
                    nombre: person.FirstName,
                    casa: person.HouseNumber,
                    debtor: user.Debtor
                },
                JWT_SECRET,
                { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
            );

            // Crear refresh token
            const refreshToken = jwt.sign(
                {
                    id: user.UserId,
                    email: user.Email
                },
                JWT_REFRESH_SECRET,
                { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
            );

            return res.status(200).send({
                status: "Success",
                message: "Login exitoso",
                user: {
                    id: user.UserId,
                    email: user.Email,
                    rol: user.RoleId,
                    nombre: person.FirstName,
                    casa: person.HouseNumber,
                    Debtor: user.Debtor,
                },
                accessToken,
                refreshToken
            });
        });
    }); // <<--- Esta llave FALTABA
};

const getUsers = (req, res) => {
    // Consulta SQL para obtener todos los usuarios
    const getUsersSQL = `
        SELECT 
        p.UserId, 
        p.FirstName, 
        p.LastName, 
        p.HouseNumber, 
        p.Residents, 
        p.Phone,
        u.Email,
        u.RoleId,
        u.Debtor
        FROM person p
        JOIN user u ON p.UserId = u.UserId;
    `;

    // Ejecutar la consulta SQL
    db.query(getUsersSQL, (err, result) => {
        if (err) {
            return res.status(400).send({
                status: "Error",
                message: "Error en get users"
            });
        }

        // Devolver los resultados
        return res.status(200).send({
            success: result,
        });
    });
};

const deleteUser = (req, res) => {
    const userId = req.params.id;

    // Eliminar en orden: visitas -> incomes -> bills -> person -> user
    const queries = [
        `DELETE FROM visits WHERE UserId = ?`,
        `DELETE FROM incomes WHERE UserId = ?`,
        `DELETE FROM bills WHERE UserId = ?`,
        `DELETE FROM person WHERE UserId = ?`,
        `DELETE FROM user WHERE UserId = ?`
    ];

    const executeQueries = (index = 0) => {
        if (index >= queries.length) {
            return res.status(200).send({
                status: "Success",
                message: "Usuario eliminado correctamente"
            });
        }

        db.query(queries[index], [userId], (err, result) => {
            if (err) {
                return res.status(500).send({
                    status: "Error",
                    message: "Error al eliminar dependencias del usuario",
                    error: err
                });
            }
            executeQueries(index + 1);
        });
    };

    executeQueries();
};

const updateUser = async (req, res) => {
    const userId = req.params.id;
    const {
        Email,
        RoleId,
        FirstName,
        LastName,
        HouseNumber,
        Residents,
        Phone,
        Debtor
    } = req.body;

    console.log("Update User Body", req.body);
    if (!Email || !RoleId || !FirstName || !LastName || !HouseNumber || !Residents || !Phone || !Debtor) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan campos obligatorios."
        });
    }

    try {
        // Verificar existencia del usuario
        const [userRows] = await db.promise().query(
            "SELECT * FROM user WHERE UserId = ?",
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "Usuario no encontrado."
            });
        }

        // Actualizar datos en tabla `user`
        await db.promise().query(
            "UPDATE user SET Email = ?, RoleId = ?, Debtor = ? WHERE UserId = ?",
            [Email.toLowerCase(), RoleId, Debtor, userId]
        );

        // Actualizar datos en tabla `person`
        await db.promise().query(
            `UPDATE person 
             SET FirstName = ?, LastName = ?, HouseNumber = ?, Residents = ?, Phone = ? 
             WHERE UserId = ?`,
            [FirstName, LastName, HouseNumber, Residents, Phone, userId]
        );

        return res.status(200).json({
            status: "Success",
            message: "Usuario actualizado correctamente."
        });

    } catch (err) {
        console.error("Error al actualizar usuario:", err);
        return res.status(500).json({
            status: "Error",
            message: "Error interno al actualizar el usuario."
        });
    }
};

const getUser = (req, res) => {
    const userId = req.params.id;

    // Consulta SQL para obtener un usuario por ID
    const getUserSQL = `
        SELECT UserId, Email, RoleId, UserName, Debtor
        FROM user
        WHERE UserId = ?
    `;

    // Ejecutar la consulta SQL
    db.query(getUserSQL, [userId], (err, result) => {
        if (err) {
            return res.status(400).send({
                status: "Error",
                message: "Error al obtener el usuario"
            });
        }

        if (result.length === 0) {
            return res.status(404).send({
                status: "Error",
                message: "Usuario no encontrado"
            });
        }

        // Devolver los resultados
        return res.status(200).send({
            success: result[0],
        });
    });
};


const getFullUser = (req, res) => {
    const userId = req.params.id;

    const getUserSQL = `
        SELECT 
            p.UserId, 
            p.FirstName, 
            p.LastName, 
            p.HouseNumber, 
            p.Residents, 
            p.Phone,
            u.Email,
            u.RoleId
            u.Debtor
        FROM person p
        JOIN user u ON p.UserId = u.UserId
        WHERE p.UserId = ?;
    `;

    db.query(getUserSQL, [userId], (err, result) => {
        if (err) {
            return res.status(400).send({
                status: "Error",
                message: "Error al obtener el usuario"
            });
        }

        if (result.length === 0) {
            return res.status(404).send({
                status: "Error",
                message: "Usuario no encontrado"
            });
        }

        return res.status(200).send({
            success: result[0],
        });
    });
};

module.exports = {
    test,
    register,
    login,
    getUsers,
    deleteUser,
    updateUser,
    getUser,
    getFullUser
}