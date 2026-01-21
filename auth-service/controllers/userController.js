const userService = require('../services/userService');
const pino = require('pino');
const logger = pino({ transport: { target: "pino-pretty" } });

const userController = {
    // Obter perfil do utilizador autenticado
    getMe: async (req, res) => {
        try {
            logger.info(`Utilizador ID ${req.user.id} solicitou o seu perfil`);
            const user = await userService.getMe(req.user.id);
            return res.status(200).json({ user });
        } catch (error) {
            logger.error(`Erro ao obter perfil do ID ${req.user.id}: ${error.message}`);
            const status = error.status || 500;
            const message = error.message || "Erro ao obter dados.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Atualizar perfil do utilizador autenticado
    updateMe: async (req, res) => {
        try {
            logger.info(`Utilizador ID ${req.user.id} está a tentar atualizar o perfil`);
            const result = await userService.updateMe(req.user.id, req.body);
            logger.info(`Perfil do utilizador ID ${req.user.id} atualizado com sucesso`);
            return res.status(200).json(result);
        } catch (error) {
            logger.error(`Erro ao atualizar perfil do ID ${req.user.id}: ${error.message}`);
            const status = error.status || 500;
            const message = error.message || "Erro ao atualizar perfil.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Listar todos os utilizadores (apenas admin)
    getAllUsers: async (req, res) => {
        try {
            logger.info(`Admin ID ${req.user.id} solicitou listagem de utilizadores`);
            const filters = {
                tipo: req.query.tipo,
                isBanned: req.query.isBanned
            };
            const pagination = {
                limit: req.query.limit,
                page: req.query.page
            };
            const result = await userService.getAllUsers(filters, pagination);
            return res.status(200).json(result);
        } catch (error) {
            logger.error(`Erro ao listar utilizadores por Admin ${req.user.id}: ${error.message}`);
            const status = error.status || 500;
            const message = error.message || "Erro ao listar utilizadores.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Banir/desbanir utilizador (apenas admin)
    banUser: async (req, res) => {
        try {
            const { userID } = req.params;
            const { isBanned } = req.body;
            logger.warn(`Admin ID ${req.user.id} está a alterar estado de banimento do utilizador ${userID}`);
            
            const result = await userService.banUser(userID, isBanned, req.user.id);
            
            logger.warn(`Utilizador ${userID} marcado como banido: ${isBanned}`);
            return res.status(200).json(result);
        } catch (error) {
            logger.error(`Erro ao banir utilizador ${req.params.userID}: ${error.message}`);
            const status = error.status || 500;
            const message = error.message || "Erro ao processar banimento.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Promover utilizador a admin (apenas admin)
    promoteToAdmin: async (req, res) => {
        try {
            const { userID } = req.params;
            logger.warn(`Admin ID ${req.user.id} está a promover utilizador ${userID} a ADMIN`);
            
            const result = await userService.promoteToAdmin(userID);
            
            logger.warn(`Utilizador ${userID} promovido com sucesso`);
            return res.status(200).json(result);
        } catch (error) {
            logger.error(`Erro ao promover utilizador ${req.params.userID}: ${error.message}`);
            const status = error.status || 500;
            const message = error.message || "Erro ao processar promoção.";
            return res.status(status).json({ errorMessage: message });
        }
    }
};

module.exports = userController;