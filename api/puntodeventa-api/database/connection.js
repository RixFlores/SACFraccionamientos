// db.js
const mysql = require('mysql2');

// Crear una conexión a la base de datos
const connection = mysql.createConnection({
  host: '127.0.0.1',    // Cambia esto por la dirección de tu base de datos
  user: 'root',   // Usuario de la base de datos
  password: '', // Contraseña de la base de datos
  database: 'fraccionamiento_agaves'  // Nombre de la base de datos
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión: ' + err.stack);
    return;
  }
  console.log('Conectado a la base de datos con ID: ' + connection.threadId);
});

module.exports = connection;
