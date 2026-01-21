const authService = require('../services/authService');
const pino = require('pino');
const logger = pino({ transport: { target: "pino-pretty" } });

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            logger.info(`Tentativa de login: ${email}`); 
            const result = await authService.login(email, password);
            logger.info(`Login bem sucedido por: ${email}`);
        
            return res.status(200).json(result);
        } catch (error) {
            logger.error(`Erro no login para ${req.body.email}: ${error.message}`); 
            const status = error.status || 500;
            return res.status(status).json({ errorMessage: error.message });
        }
    },
    

    register: async (req, res) => {
        try {
            const { username, email, password, tipo } = req.body;
            logger.info(`Novo registo solicitado: ${email} (${tipo})`);
            const result = await authService.register(username, email, password, tipo);
            logger.info(`Utilizador criado com ID: ${result.user.id}`);
            return res.status(201).json(result);
        } catch (error) {
            logger.error(`Erro no registo de ${req.body.email}: ${error.message}`);
            const status = error.status || 500;
            return res.status(status).json({ errorMessage: error.message });
        }
    }
};

module.exports = authController;