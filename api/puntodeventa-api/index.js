const connection = require("./database/connection");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Servidor node
const app = express();
const puerto = 3900;

// Configurar cors
/* app.use(cors()); */

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));


// Convertir body a objeto JS
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
const userRoutes = require('./routes/user');
const billsRoutes = require('./routes/bills');
const incomesRoutes = require('./routes/incomes');
const visitsRoutes = require('./routes/visits');
const deletedHistoryRoutes = require('./routes/deletedHistory');
const balanceRoutes = require('./routes/balance');
const commentsRoutes = require('./routes/comments');
const rolesRoutes = require('./routes/roles');
const finesRoutes = require('./routes/fines');
const notificationsRoutes = require('./routes/notifications');

/* 
const cardContentRoutes = require('./routes/cardContentRoutes');
const cardStylesRoutes = require('./routes/cardStylesRoutes');
const cardGuestDetailsRoutes = require('./routes/cardGuestDetailsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
*/

// Usar las rutas
app.use('/api/user', userRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/incomes', incomesRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/deletedHistory', deletedHistoryRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/fines', finesRoutes);
app.use('/api/notifications', notificationsRoutes);

/* 
app.use('/api', cardContentRoutes);
app.use('/api/styles', cardStylesRoutes);
app.use('/api/guestDetails', cardGuestDetailsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payment', stripeRoutes); 
*/

// Servidor y escuchar peticiones HTTP 
app.listen(puerto, () => {
  console.log('Servidor corriendo en el puerto ' + puerto);
});
