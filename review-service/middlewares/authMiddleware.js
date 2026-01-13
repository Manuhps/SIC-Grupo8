const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'PROJECTS_SECRET';

const authMiddleware = {
    // Verificar se o Token é válido
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
            
            // Adiciona os dados do utilizador ao request
            req.user = decoded; 
            
            next();
        } catch (err) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }
    },

    // Middleware para verificar se é Estudante
    isEstudante: (req, res, next) => {
        if (req.user.tipo !== 'estudante' && req.user.tipo !== 'admin') {
            return res.status(403).json({ 
                message: "Acesso negado. Apenas estudantes ou administradores podem aceder a este recurso." 
            });
        }
        next();
    },

    // Middleware para verificar se é Admin
    isAdmin: (req, res, next) => {
        if (req.user.tipo !== 'admin') {
            return res.status(403).json({ 
                message: "Acesso negado. Apenas administradores podem aceder a este recurso." 
            });
        }
        next();
    }
};

module.exports = authMiddleware;
