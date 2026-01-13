const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// Usa as rotas de avaliações
app.use('/reviews', avaliacaoRoutes); 

// Sincroniza a DB e inicia o servidor
db.sync({ alter: true })
    .then(() => {
        console.log("Base de dados Reviews conectada e sincronizada!");
        app.listen(3005, () => {
            console.log("Review Service a correr na porta 3005");
        });
    })
    .catch(err => {
        console.error("Erro ao conectar:", err);
    });
