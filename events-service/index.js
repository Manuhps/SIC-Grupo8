const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const eventoRoutes = require('./routes/eventoRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// Usa as rotas de eventos
app.use('/events', eventoRoutes); 

// Função de ligação com tentativas
async function connectDB() {
    let retries = 10; // aumenta o número de tentativas
    while (retries > 0) {
        try {
            await db.authenticate();
            console.log("Base de dados Events conectada!");
            await db.sync({ alter: true });
            app.listen(3003, () => {
                console.log("Events Service a correr na porta 3003");
            });
            return;
        } catch (err) {
            retries--;
            console.warn(`Conexão falhou. Tentativas restantes: ${retries}`);
            await new Promise(res => setTimeout(res, 5000)); // espera 5 segundos
        }
    }
    console.error("Erro: Não foi possível ligar à base de dados Events.");
    process.exit(1);
}

connectDB();