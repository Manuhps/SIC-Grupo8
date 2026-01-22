const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const pino = require('pino');
const logger = pino({ transport: { target: "pino-pretty" } });
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");

const app = express();
app.use(express.json());
app.use(cors());

// Swagger Page
app.use('/api-docs', swaggerUi.serve, (req, res) => {
    delete require.cache[require.resolve('./swagger-output.json')];
    const freshSwaggerFile = require('./swagger-output.json');
    swaggerUi.setup(freshSwaggerFile)(req, res);
});

// Routes
app.use('/auth', userRoutes);

async function connectDB() {
    let retries = 5;
    while (retries > 0) {
        try {
            await db.authenticate();
            logger.info("Base de dados conectada com sucesso!");
            await db.sync({ alter: true });
            app.listen(3001, () => {
                logger.info("Auth Service a correr em http://localhost:3001");
                logger.info("Documentação em http://localhost:3001/api-docs");
            });
            return;
        } catch (err) {
            retries--;
            logger.warn(`Conexão falhou. Tentativas restantes: ${retries}`);
            await new Promise(res => setTimeout(res, 3000));
        }
    }
    logger.error("Não foi possível ligar à base de dados.");
}

connectDB();