const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const jwt = require('jsonwebtoken');

const db = require('./config/db');
const alojamentoRoutes = require('./routes/alojamentoRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json'); 
const pino = require('pino');
const logger = pino({ transport: { target: 'pino-pretty' } });

const app = express();
app.use(express.json());
app.use(cors());

// Rota da Documentação Swagger
app.use('/api-docs', swaggerUi.serve, (req, res) => {
    delete require.cache[require.resolve('./swagger-output.json')];
    const freshSwaggerFile = require('./swagger-output.json');
    swaggerUi.setup(freshSwaggerFile)(req, res);
}); 

app.use('/accommodations', alojamentoRoutes);

// Função de conexão original com Retry + Pino Logs
async function connectDB() {
    let retries = 5;
    while (retries > 0) {
        try {
            await db.authenticate();
            logger.info("Base de dados conectada com sucesso!");
            
            await db.sync({ alter: true });
            logger.info("Base de dados sincronizada!");
            
            const PORT = 3002;
            app.listen(PORT, () => {
                logger.info(`Accommodation Service a correr em http://localhost:${PORT}`);
                logger.info(`Documentação disponível em http://localhost:${PORT}/api-docs`);
            });
            return;
        } catch (err) {
            retries--;
            logger.warn(`Aguardando a base de dados... (tentativas restantes: ${retries})`);
            await new Promise(resolve => setTimeout(resolve, 3000)); 
        }
    }
    logger.error("Erro: Não foi possível conectar à base de dados após 5 tentativas");
    process.exit(1);
}

connectDB();