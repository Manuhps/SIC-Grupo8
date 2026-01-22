const express = require('express');
const cors = require('cors');
const path = require('path');
const pino = require('pino');
const logger = pino({ transport: { target: "pino-pretty" } });
const swaggerUi = require('swagger-ui-express');
const db = require('./config/db');
const reservaRoutes = require('./routes/reservaRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// Swagger Page
app.use('/api-docs', swaggerUi.serve, (req, res) => {
    delete require.cache[require.resolve('./swagger-output.json')];
    const freshSwaggerFile = require('./swagger-output.json');
    swaggerUi.setup(freshSwaggerFile)(req, res);
});

// Rotas do Serviço
app.use('/reservations', reservaRoutes);

// Função de conexão com a Base de Dados (Retry Logic)
async function connectDB() {
    let retries = 5;
    while (retries > 0) {
        try {
            // Tenta autenticar com o host 'reservation-db' definido no docker-compose
            await db.authenticate();
            logger.info("Base de dados de Reservas conectada com sucesso!");
            
            // Sincroniza os modelos (cria as tabelas se não existirem)
            await db.sync({ alter: true });
            logger.info("Base de dados de Reservas sincronizada!");
            
            const PORT = 3004;
            app.listen(PORT, () => {
                logger.info(`Reservation Service a correr em http://localhost:${PORT}`);
                logger.info(`Documentação disponível em http://localhost:${PORT}/api-docs`);
            });
            return;
        } catch (err) {
            retries--;
            logger.warn(`Aguardando a base de dados de Reservas... (tentativas restantes: ${retries})`);
            // Espera 3 segundos antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 3000)); 
        }
    }
    
    logger.error("Erro Fatal: Não foi possível conectar à base de dados de Reservas após 5 tentativas");
    process.exit(1);
}

// Iniciar a aplicação
connectDB();