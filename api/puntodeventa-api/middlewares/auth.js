// Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

// Importar clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;

// MIDDLEWARE de autenticacion
exports.auth = (req, res, next) => {
    // Comprobar si recibo la cabecera de la autenticacion 
    if (!req.headers['authorization']) {
        return res.status(403).send({
            status: "Error",
            message: "La peticion no tiene la cabecera de autorización"
        });
    }

    // Limpiar el token, quita comillas y prefijo 'Bearer'
    let token = req.headers['authorization'].replace(/['"\[\]]+/g, '').replace('Bearer ', '');
    console.log("TOKEN A MODIFICAR",token)
/*     let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY2OTM1ZjU4YTE1MTdjYzcwODg5MjhlOSIsImlhdCI6MTcyMTE4Nzc2MiwiZXhwIjoxNzIxMjc0MTYyfQ.6NOeR_vJmQrujZqjdMsBsJk64-OnzV1GP-_AVpAYl1g'
 */    

    try {
        let payload = jwt.decode(token, secret);
        // Comprobar expiracion del token
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "Error",
                message: "Token expirado"
            });
        }

        // Agregar datos de usuario a request
        req.user = payload;
        console.log("RESULTADO", req.user)

    } catch (error) {
        return res.status(404).send({
            status: "Error",
            message: "Token invalido",
            error
        });
    }

    // Pasar a ejecucion de accion 
    next();
};
