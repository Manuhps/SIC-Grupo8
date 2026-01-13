const userService = require('../services/userService');

const userController = {
    // Obter perfil do utilizador autenticado
    getMe: async (req, res) => {
        try {
            const user = await userService.getMe(req.user.id);
            return res.status(200).json({ user });
        } catch (error) {
            console.error(error);
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Atualizar perfil do utilizador autenticado
    updateMe: async (req, res) => {
        try {
            const result = await userService.updateMe(req.user.id, req.body);
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Listar todos os utilizadores (apenas admin)
    getAllUsers: async (req, res) => {
        try {
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
            console.error(error);
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Banir/desbanir utilizador (apenas admin)
    banUser: async (req, res) => {
        try {
            const { userID } = req.params;
            const { isBanned } = req.body;
            const result = await userService.banUser(userID, isBanned, req.user.id);
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Promover utilizador a admin (apenas admin)
    promoteToAdmin: async (req, res) => {
        try {
            const { userID } = req.params;
            const result = await userService.promoteToAdmin(userID);
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            const status = error.status || 500;
            const message = error.message || "Ocorreu um erro. Por favor, tente novamente mais tarde.";
            return res.status(status).json({ errorMessage: message });
        }
    }
};

module.exports = userController;

