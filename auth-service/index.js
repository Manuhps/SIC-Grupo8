const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// Usa as rotas de utilizador/autenticação
app.use('/auth', userRoutes); 

// Sincroniza a DB e inicia o servidor
db.sync({ alter: true })
    .then(() => {
        console.log("Base de dados Auth conectada e sincronizada!");
        app.listen(3001, () => {
            console.log("Auth Service a correr na porta 3001");
        });
    })
    .catch(err => {
        console.error("Erro ao conectar:", err);
    });

