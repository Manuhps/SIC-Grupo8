const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const SECRET = process.env.JWT_SECRET || 'PROJECTS_SECRET';

const authService = {
    // Lógica de login
    login: async (email, password) => {
        // Validação de campos
        if (!email || !password) {
            throw { status: 400, message: "Por favor, forneça email e password." };
        }

        // Buscar utilizador
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            throw { 
                status: 401, 
                message: "Credenciais inválidas.",
                details: "Não existe nenhum utilizador registado com este email."
            };
        }

        // Verificar se está banido
        if (user.isBanned) {
            throw { 
                status: 403, 
                message: "Esta conta foi banida.",
                details: "Contacte o administrador para mais informações."
            };
        }

        // Verificar password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            throw { 
                status: 401, 
                message: "Credenciais inválidas.",
                details: "A password fornecida está incorreta."
            };
        }

        // Gerar token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                tipo: user.tipo,
                username: user.username
            },
            SECRET,
            { expiresIn: '24h' }
        );

        // Retornar dados do utilizador sem password
        const userWithoutPassword = {
            id: user.id,
            username: user.username,
            email: user.email,
            tipo: user.tipo
        };

        return {
            message: "Login efetuado com sucesso.",
            token,
            user: userWithoutPassword
        };
    },

    // Lógica de registo
    register: async (username, email, password, tipo) => {
        // Validação de campos obrigatórios
        if (!username || !email || !password || !tipo) {
            throw { 
                status: 400, 
                message: "Por favor, preencha todos os campos obrigatórios.",
                details: "Campos obrigatórios: username, email, password, tipo"
            };
        }

        // Verificar se email já existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw { 
                status: 400, 
                message: "Este email já está registado." 
            };
        }

        // Verificar se username já existe
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            throw { 
                status: 400, 
                message: "Este nome de utilizador já está em uso." 
            };
        }

        // Validar tipo de utilizador
        const tiposValidos = ['estudante', 'proprietario', 'organizador'];
        if (!tiposValidos.includes(tipo)) {
            throw { 
                status: 400, 
                message: "Tipo de utilizador inválido. Os tipos permitidos são: estudante, proprietario, organizador." 
            };
        }

        // Hash da password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar utilizador
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            tipo
        });

        // Retornar dados do utilizador sem password
        const userWithoutPassword = {
            id: user.id,
            username: user.username,
            email: user.email,
            tipo: user.tipo
        };

        return {
            message: "Utilizador registado com sucesso.",
            user: userWithoutPassword
        };
    }
};

module.exports = authService;
