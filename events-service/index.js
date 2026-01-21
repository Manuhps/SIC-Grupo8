const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const eventoRoutes = require('./routes/eventoRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// Usa as rotas de eventos
app.use('/events', eventoRoutes); 

// Sincroniza a DB e inicia o servidor
db.sync({ alter: true })
    .then(() => {
        console.log("Base de dados Events conectada e sincronizada!");
        app.listen(3003, () => {
            console.log("Events Service a correr na porta 3003");
        });
    })
    .catch(err => {
        console.error("Erro ao conecta:", err);
    });
