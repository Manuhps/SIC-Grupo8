const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const userService = {
    // Obter perfil do utilizador
    getMe: async (userId) => {
        const user = await User.findByPk(userId);
        
        if (!user) {
            throw { status: 404, message: "User Not Found." };
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            address: user.address,
            profileImg: user.profileImg,
            tipo: user.tipo,
            isBanned: user.isBanned
        };
    },

    // Atualizar perfil do utilizador
    updateMe: async (userId, updateData) => {
        const { username, email, password, address, profileImg } = updateData;

        // Validar que pelo menos um campo foi fornecido
        if (!username && !email && !password && !address && !profileImg) {
            throw { 
                status: 400, 
                message: "Please provide valid values to update." 
            };
        }

        const dataToUpdate = {};
        if (username) dataToUpdate.username = username;
        if (email) dataToUpdate.email = email;
        if (address) dataToUpdate.address = address;
        if (profileImg) dataToUpdate.profileImg = profileImg;
        
        // Se houver password, fazer hash
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        await User.update(dataToUpdate, {
            where: { id: userId }
        });

        return { message: "Dados atualizados com sucesso." };
    },

    // Listar todos os utilizadores
    getAllUsers: async (filters, pagination) => {
        const { tipo, isBanned } = filters;
        const { limit = 5, page = 0 } = pagination;
        
        // Validações
        if (limit <= 0) {
            throw { 
                status: 400, 
                message: "Limit must be a positive number, higher than 0" 
            };
        }

        if (page < 0) {
            throw { 
                status: 400, 
                message: "Page must be 0 or a positive number" 
            };
        }

        // Construir filtros
        const where = {};
        if (tipo) where.tipo = tipo;
        if (isBanned !== undefined) where.isBanned = isBanned === 'true';
        
        const offset = parseInt(page) * parseInt(limit);

        // Buscar utilizadores
        const { count: totalUsers, rows: users } = await User.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: offset,
            attributes: ['id', 'username', 'email', 'tipo', 'isAdmin', 'isBanned', 'address', 'profileImg']
        });

        if (totalUsers === 0) {
            throw { 
                status: 404, 
                message: "No users found matching the criteria" 
            };
        }

        const links = [
            { rel: "banUser", href: "/users/:userID", method: "PATCH" },
            { rel: "promoteToAdmin", href: "/users/:userID/promote", method: "PATCH" }
        ];

        return {
            pagination: {
                totalItems: totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            },
            data: users,
            links
        };
    },

    // Banir/desbanir utilizador
    banUser: async (userID, isBanned, currentUserId) => {
        // Validações
        if (typeof isBanned !== 'boolean') {
            throw { 
                status: 400, 
                message: "Please provide a valid isBanned value (true or false)." 
            };
        }

        const user = await User.findByPk(userID);
        if (!user) {
            throw { 
                status: 404, 
                message: "User not found." 
            };
        }

        if (user.id === currentUserId) {
            throw { 
                status: 400, 
                message: "You cannot ban or unban yourself." 
            };
        }

        await User.update({ isBanned }, { where: { id: userID } });
        
        const action = isBanned ? "banned" : "unbanned";
        return { message: `User ${action} successfully.` };
    },

    // Promover utilizador a admin
    promoteToAdmin: async (userID) => {
        const userToPromote = await User.findByPk(userID);
        if (!userToPromote) {
            throw { 
                status: 404, 
                message: "User nao encontrado." 
            };
        }

        if (userToPromote.tipo === 'admin') {
            throw { 
                status: 400, 
                message: "Este user já é um admin." 
            };
        }

        await userToPromote.update({
            tipo: 'admin',
            isAdmin: true
        });

        return {
            message: "user promovido a admin com sucesso.",
            user: {
                id: userToPromote.id,
                username: userToPromote.username,
                email: userToPromote.email,
                tipo: userToPromote.tipo
            }
        };
    }
};

module.exports = userService;
