const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log('Tentativa de login para email:', email);

            if (!email || !password) {
                console.log('Faltam credenciais:', { email: !!email, password: !!password });
                return res.status(400).json({ 
                    errorMessage: "Por favor, forneça email e password.",
                    details: {
                        email: !email ? "Email é obrigatório" : "Email fornecido",
                        password: !password ? "Password é obrigatória" : "Password fornecida"
                    }
                });
            }

            const user = await User.findOne({ where: { email } });
            console.log('user encontrado:', user ? 'Sim' : 'Não');
            
            if (!user) {
                return res.status(401).json({ 
                    errorMessage: "Credenciais inválidas.",
                    details: "Não existe nenhum utilizador registado com este email."
                });
            }

            if (user.isBanned) {
                return res.status(403).json({ 
                    errorMessage: "Esta conta foi banida.",
                    details: "Contacte o administrador para mais informações."
                });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            console.log('Senha válida:', validPassword ? 'Sim' : 'Não');
            
            if (!validPassword) {
                return res.status(401).json({ 
                    errorMessage: "Credenciais inválidas.",
                    details: "A password fornecida está incorreta."
                });
            }

            const token = jwt.sign(
                { id: user.id, tipo: user.tipo },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            const userWithoutPassword = {
                id: user.id,
                username: user.username,
                email: user.email,
                tipo: user.tipo
            };

            console.log('Login bem sucedido para:', user.username);
            return res.status(200).json({
                message: "Login efetuado com sucesso.",
                token,
                user: userWithoutPassword
            });

        } catch (error) {
            console.error('Erro detalhado no login:', error.message);
            return res.status(500).json({ 
                errorMessage: "Ocorreu um erro durante o login.",
            });
        }
    },

    register: async (req, res) => {
        try {
            console.log('Conteúdo de req.body:', req.body);
            const { username, email, password, tipo } = req.body;

            if (!username || !email || !password || !tipo) {
                return res.status(400).json({ 
                    errorMessage: "Por favor, preencha todos os campos obrigatórios." 
                });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ 
                    errorMessage: "Este email já está registado." 
                });
            }

            const existingUsername = await User.findOne({ where: { username } });
            if (existingUsername) {
                return res.status(400).json({ 
                    errorMessage: "Este nome de utilizador já está em uso." 
                });
            }

            const tiposValidos = ['estudante', 'proprietario', 'organizador'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({ 
                    errorMessage: "Tipo de utilizador inválido. Os tipos permitidos são: estudante, proprietario, organizador." 
                });
            }

            const user = await User.create({
                username,
                email,
                password,
                tipo
            });

            const userWithoutPassword = {
                id: user.id,
                username: user.username,
                email: user.email,
                tipo: user.tipo
            };

            return res.status(201).json({
                message: "Utilizador registado com sucesso.",
                user: userWithoutPassword
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                errorMessage: "Ocorreu um erro durante o registo.",
            });
        }
    },

    getMe: async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id);
            
            if (!user) {
                return res.status(404).json({ errorMessage: "User Not Found." });
            }

            return res.status(200).json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    address: user.address,
                    profileImg: user.profileImg,
                    tipo: user.tipo,
                    isBanned: user.isBanned
                },
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ errorMessage: "Something went wrong. Please try again later." });
        }
    },

    updateMe: async (req, res) => {
        try {
            const { username, email, password, address, profileImg } = req.body;
            const userId = req.user.id;

            if (!username && !email && !password && !address && !profileImg) {
                return res.status(400).json({ errorMessage: "Please provide valid values to update." });
            }

            await User.update({ username, email, password, address, profileImg }, {
                where: { id: userId }
            });
            return res.status(200).json({ message: "Dados atualizados com sucesso." });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ errorMessage: "Something went wrong. Please try again later." });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const { tipo, isBanned, limit = 5, page = 0 } = req.query;
            
            if (limit <= 0) {
                return res.status(400).json({ errorMessage: "Limit must be a positive number, higher than 0" });
            }

            if (page < 0) {
                return res.status(400).json({ errorMessage: "Page must be 0 or a positive number" });
            }

            const filters = {};
            if (tipo) filters.tipo = tipo;
            if (isBanned !== undefined) filters.isBanned = isBanned === 'true';
            
            const offset = parseInt(page) * parseInt(limit);

            const { count: totalUsers, rows: users } = await User.findAndCountAll({
                where: filters,
                limit: parseInt(limit),
                offset: offset,
                attributes: ['id', 'username', 'email', 'tipo', 'isAdmin', 'isBanned', 'address', 'profileImg']
            });

            if (totalUsers === 0) {
                 return res.status(404).json({ errorMessage: "No users found matching the criteria" });
            }

            const links = [
                { rel: "banUser", href: "/users/:userID", method: "PATCH" },
                { rel: "promoteToAdmin", href: "/users/:userID/promote", method: "PATCH" }
            ];

            return res.status(200).json({
                pagination: {
                    totalItems: totalUsers,
                    totalPages: Math.ceil(totalUsers / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                },
                data: users,
                links
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ errorMessage: "Something went wrong. Please try again later." });
        }
    },

    banUser: async (req, res) => {
        try {
            const { userID } = req.params;
            const { isBanned } = req.body;

            if (req.user.tipo !== 'admin') {
                 return res.status(403).json({ errorMessage: "This action requires administrator privileges." });
            }

            if (typeof isBanned !== 'boolean') {
                return res.status(400).json({ errorMessage: "Please provide a valid isBanned value (true or false)." });
            }

            const user = await User.findByPk(userID);
            if (!user) {
                return res.status(404).json({ errorMessage: "User not found." });
            }

            if (user.id === req.user.id) {
                 return res.status(400).json({ errorMessage: "You cannot ban or unban yourself." });
            }

            await User.update({ isBanned }, { where: { id: userID } });
            
            const action = isBanned ? "banned" : "unbanned";
            return res.status(200).json({ message: `User ${action} successfully.` });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ errorMessage: "Something went wrong. Please try again later." });
        }
    },

    promoteToAdmin: async (req, res) => {
        try {
            const { userID } = req.params;

            // Verificar se o usuário que está fazendo a requisição é admin
            if (req.user.tipo !== 'admin') {
                return res.status(403).json({ 
                    errorMessage: "Apenas admins podem promover outros users." 
                });
            }

            // Buscar o usuário que será promovido
            const userToPromote = await User.findByPk(userID);
            if (!userToPromote) {
                return res.status(404).json({ 
                    errorMessage: "User nao encontrado." 
                });
            }

            // Verificar se o usuário já é admin
            if (userToPromote.tipo === 'admin') {
                return res.status(400).json({ 
                    errorMessage: "Este user já é um admin." 
                });
            }

            // Promover o usuário para admin
            await userToPromote.update({
                tipo: 'admin',
                isAdmin: true
            });

            return res.status(200).json({
                message: "user promovido a admin com sucesso.",
                user: {
                    id: userToPromote.id,
                    username: userToPromote.username,
                    email: userToPromote.email,
                    tipo: userToPromote.tipo
                }
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                errorMessage: "Ocorreu um erro. Por favor, tente novamente mais tarde." 
            });
        }
    }
};

module.exports = userController; 