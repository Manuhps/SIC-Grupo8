const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// Usa as rotas de avaliações
app.use('/reviews', avaliacaoRoutes); 

// Função para tentar conectar à BD com retry
async function connectDB() {
    let retries = 10;
    while (retries > 0) {
        try {
            await db.authenticate();
            console.log("Base de dados conectada!");
            await db.sync({ alter: true });
            console.log("Base de dados sincronizada!");
            app.listen(3005, () => {
                console.log("A correr na porta 3005");
            });
            return;
        } catch (err) {
            retries--;
                    console.error(`Aguardando a base de dados... (tentativas restantes: ${retries}) ${err}`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Aguarda 3 segundos
        }
    }
    console.error("Erro ao conectar à base de dados após 10 tentativas");
    process.exit(1);
}
connectDB();
