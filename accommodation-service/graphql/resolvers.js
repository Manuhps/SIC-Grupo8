const Alojamento = require('../models/alojamentoModel');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

// Função para verificar token do contexto
const checkAuth = (context) => {
    if (!context.user) {
        throw new Error('Não autenticado. Faça login primeiro.');
    }
    return context.user;
};

// Função para verificar se é proprietário
const checkProprietario = (context) => {
    const user = checkAuth(context);
    if (user.tipo !== 'proprietario' && user.tipo !== 'admin') {
        throw new Error('Não autorizado. Apenas proprietários podem realizar esta ação.');
    }
    return user;
};

const resolvers = {
    Query: {
        // Buscar todos os alojamentos (público)
        alojamentos: async () => {
            return await Alojamento.findAll();
        },

        // Buscar alojamento por ID (público)
        alojamento: async (_, { id }) => {
            const alojamento = await Alojamento.findByPk(id);
            if (!alojamento) {
                throw new Error('Alojamento não encontrado');
            }
            return alojamento;
        },

        // Buscar por zona (público)
        alojamentosPorZona: async (_, { zona }) => {
            return await Alojamento.findAll({
                where: { zona }
            });
        },

        // Buscar por tipo (público)
        alojamentosPorTipo: async (_, { tipo }) => {
            return await Alojamento.findAll({
                where: { tipo }
            });
        },

        // Buscar alojamentos do proprietário logado (autenticado)
        meusAlojamentos: async (_, __, context) => {
            const user = checkAuth(context);
            return await Alojamento.findAll({
                where: { proprietario_id: user.id }
            });
        }
    },

    Mutation: {
        // Criar alojamento (apenas proprietários)
        createAlojamento: async (_, { input }, context) => {
            const user = checkProprietario(context);
            
            const alojamento = await Alojamento.create({
                ...input,
                proprietario_id: user.id
            });
            
            return alojamento;
        },

        // Atualizar alojamento (proprietário do alojamento ou admin)
        updateAlojamento: async (_, { id, input }, context) => {
            const user = checkProprietario(context);
            
            const alojamento = await Alojamento.findByPk(id);
            if (!alojamento) {
                throw new Error('Alojamento não encontrado');
            }

            // Verificar se é o dono ou admin
            if (alojamento.proprietario_id !== user.id && user.tipo !== 'admin') {
                throw new Error('Não autorizado. Apenas o proprietário pode editar este alojamento.');
            }

            await alojamento.update(input);
            return alojamento;
        },

        // Apagar alojamento (proprietário do alojamento ou admin)
        deleteAlojamento: async (_, { id }, context) => {
            const user = checkProprietario(context);
            
            const alojamento = await Alojamento.findByPk(id);
            if (!alojamento) {
                throw new Error('Alojamento não encontrado');
            }

            // Verificar se é o dono ou admin
            if (alojamento.proprietario_id !== user.id && user.tipo !== 'admin') {
                throw new Error('Não autorizado. Apenas o proprietário pode apagar este alojamento.');
            }

            await alojamento.destroy();
            return true;
        }
    }
};

module.exports = resolvers;
