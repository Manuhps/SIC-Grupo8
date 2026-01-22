const express = require('express');
const cors = require('cors');
const pino = require('pino');
const logger = pino({ transport: { target: "pino-pretty" } });
const swaggerUi = require('swagger-ui-express');
const db = require('./config/db');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// Swagger Page
app.use('/api-docs', swaggerUi.serve, (req, res) => {
    delete require.cache[require.resolve('./swagger-output.json')];
    const freshSwaggerFile = require('./swagger-output.json');
    swaggerUi.setup(freshSwaggerFile)(req, res);
});

// Usa as rotas de avaliações
app.use('/reviews', avaliacaoRoutes); 

// Função para tentar conectar à BD com retry
async function connectDB() {
    let retries = 10;
    while (retries > 0) {
        try {
            await db.authenticate();
            logger.info("Base de dados de Reviews conectada com sucesso!");
            
            await db.sync({ alter: true });
            logger.info("Base de dados de Reviews sincronizada!");
            
            const PORT = 3005;
            app.listen(PORT, () => {
                logger.info(`Review Service a correr em http://localhost:${PORT}`);
                logger.info(`Documentação disponível em http://localhost:${PORT}/api-docs`);
            });
            return;
        } catch (err) {
            retries--;
            logger.warn(`Aguardando a base de dados de Reviews... (tentativas restantes: ${retries})`);
            await new Promise(resolve => setTimeout(resolve, 3000)); 
        }
    }
    logger.error("Erro Fatal: Não foi possível conectar à base de dados de Reviews");
    process.exit(1);
}

connectDB();