const authService = require('../services/authService');

const authController = {
    // Login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            return res.status(200).json(result);
        } catch (error) {
            console.error('Erro no login:', error);
            const status = error.status || 500;
            const message = error.message || "Ocorreu um erro durante o login.";
            return res.status(status).json({ 
                errorMessage: message,
                details: error.details
            });
        }
    },

    // Registo
    register: async (req, res) => {
        try {
            const { username, email, password, tipo } = req.body;
            const result = await authService.register(username, email, password, tipo);
            return res.status(201).json(result);
        } catch (error) {
            console.error('Erro no registo:', error);
            const status = error.status || 500;
            const message = error.message || "Ocorreu um erro durante o registo.";
            return res.status(status).json({ 
                errorMessage: message,
                details: error.details
            });
        }
    }
};

module.exports = authController;

