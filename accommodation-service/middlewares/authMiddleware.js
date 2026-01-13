const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'PROJECTS_SECRET';

const authMiddleware = {
    // 1. Verificar se o Token é válido
    verifyToken: (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Token não fornecido.' });
        }

        // O formato é "Bearer <token>"
        const token = authHeader.split(' ')[1];

        try {
            // Descodifica o token
            const decoded = jwt.verify(token, SECRET);
            
            // IMPORTANTE: Em vez de ir à BD buscar o user, usamos os dados que vieram no token!
            req.user = decoded; 
            
            next();
        } catch (err) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }
    },

    // 2. Middleware para verificar se é Proprietário
    isProprietario: (req, res, next) => {
        // Verifica se o tipo de utilizador no token é 'proprietario'
        if (req.user.tipo !== 'proprietario') {
            return res.status(403).json({ 
                message: "Acesso negado. Apenas proprietários podem aceder a este recurso." 
            });
        }
        next();
    },

    // Podes manter os outros se precisares no futuro, mas para o Alojamento o importante é o de cima
    isAdmin: (req, res, next) => {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
        }
        next();
    }
};

module.exports = authMiddleware;