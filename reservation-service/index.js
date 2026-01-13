const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const reservaRoutes = require('./routes/reservaRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// Usa as rotas de reservas
app.use('/reservations', reservaRoutes); 

// Sincroniza a DB e inicia o servidor
db.sync({ alter: true })
    .then(() => {
        console.log("Base de dados Reservations conectada e sincronizada!");
        app.listen(3004, () => {
            console.log("Reservation Service a correr na porta 3004");
        });
    })
    .catch(err => {
        console.error("Erro ao conectar", err);
    });
