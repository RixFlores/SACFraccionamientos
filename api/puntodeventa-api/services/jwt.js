//Dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

//Private key
const secret = "CLAVE_SECRETA_DEL_PROYECTO_123456";

//Genera token 
const createToken = (user) =>{
    const payload = {
        id:user._id,
        name:user.name,
        nick:user.nick,
        email:user.email,
        role:user.role,
        imagen:user.image,
        iat:moment().unix(), //Fecha de creacion del token
        exp:moment().add(1,"days").unix() //Fecha de expiracion del token
    }
        
    //Devuelte token
    return jwt.encode(payload, secret);
}

module.exports={
    createToken,
    secret
}