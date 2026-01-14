const Avaliacao = require('../models/avaliacaoModel');
const { Op } = require('sequelize');
const accommodationClient = require('../utils/accommodationClient');
const eventsClient = require('../utils/eventsClient');

const avaliacaoService = {
    // Criar uma nova avaliação de alojamento
    createAlojamento: async (alojamentoId, data, userId) => {
        const { pontuacao, comentario } = data;

        if (!pontuacao) {
            throw { 
                status: 400, 
                message: "Pontuação é obrigatória",
                details: "A pontuação deve ser um número entre 1 e 5"
            };
        }

        if (pontuacao < 1 || pontuacao > 5) {
            throw { 
                status: 400, 
                message: "Pontuação inválida",
                details: "A pontuação deve ser um número entre 1 e 5"
            };
        }

        // Verificar se o user já avaliou este alojamento
        const avaliacaoExistente = await Avaliacao.findOne({
            where: { 
                user_id: userId, 
                alojamento_id: alojamentoId 
            }
        });

        if (avaliacaoExistente) {
            throw { 
                status: 400, 
                message: "Você já avaliou este alojamento",
                details: "Cada utilizador pode avaliar um alojamento apenas uma vez"
            };
        }

        if (!alojamentoId) {
            throw { 
                status: 400, 
                message: "ID do alojamento é obrigatório" 
            };
        }

        // Verificar se alojamento existe (chamada HTTP ao Accommodation Service)
        await accommodationClient.getAlojamentoById(alojamentoId);

        const avaliacao = await Avaliacao.create({
            user_id: userId,
            alojamento_id: alojamentoId,
            evento_id: null,
            pontuacao,
            comentario: comentario || null
        });

        return {
            message: "Avaliação criada com sucesso.",
            avaliacao
        };
    },

    // Criar uma nova avaliação de evento
    createEvento: async (eventoId, data, userId) => {
        const { pontuacao, comentario } = data;

        if (!pontuacao) {
            throw { 
                status: 400, 
                message: "Pontuação é obrigatória",
                details: "A pontuação deve ser um número entre 1 e 5"
            };
        }

        if (pontuacao < 1 || pontuacao > 5) {
            throw { 
                status: 400, 
                message: "Pontuação inválida",
                details: "A pontuação deve ser um número entre 1 e 5"
            };
        }

        // Verificar se o user já avaliou este evento
        const avaliacaoExistente = await Avaliacao.findOne({
            where: { 
                user_id: userId, 
                evento_id: eventoId 
            }
        });

        if (avaliacaoExistente) {
            throw { 
                status: 400, 
                message: "Você já avaliou este evento",
                details: "Cada utilizador pode avaliar um evento apenas uma vez"
            };
        }

        if (!eventoId) {
            throw { 
                status: 400, 
                message: "ID do evento é obrigatório" 
            };
        }

        // Verificar se evento existe (chamada HTTP ao Events Service)
        await eventsClient.getEventoById(eventoId);

        const avaliacao = await Avaliacao.create({
            user_id: userId,
            alojamento_id: null,
            evento_id: eventoId,
            pontuacao,
            comentario: comentario || null
        });

        return {
            message: "Avaliação criada com sucesso.",
            avaliacao
        };
    },

    // Listar todas as avaliações (apenas admin)
    getAll: async (filters, pagination) => {
        const { tipo } = filters;
        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        const where = {};
        if (tipo === 'alojamento') {
            where.alojamento_id = { [Op.ne]: null };
        } else if (tipo === 'evento') {
            where.evento_id = { [Op.ne]: null };
        }

        const avaliacoes = await Avaliacao.findAndCountAll({
            where,
            limit: +limit,
            offset: +offset,
            order: [['created_at', 'DESC']]
        });

        return {
            total: avaliacoes.count,
            totalPages: Math.ceil(avaliacoes.count / limit),
            currentPage: +page,
            data: avaliacoes.rows
        };
    },

    // Obter uma avaliação específica
    getById: async (id) => {
        const avaliacao = await Avaliacao.findByPk(id);

        if (!avaliacao) {
            throw { 
                status: 404, 
                message: "Avaliação não encontrada" 
            };
        }

        return avaliacao;
    },

    // Listar avaliações de um alojamento específico
    getAvaliacoesAlojamento: async (alojamentoId, pagination) => {
        // Verificar se alojamento existe e buscar detalhes (chamada HTTP)
        const alojamento = await accommodationClient.getAlojamentoById(alojamentoId);

        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        const avaliacoes = await Avaliacao.findAndCountAll({
            where: { alojamento_id: alojamentoId },
            limit: +limit,
            offset: +offset,
            order: [['created_at', 'DESC']]
        });

        // Calcular média de pontuação
        const todasAvaliacoes = await Avaliacao.findAll({
            where: { alojamento_id: alojamentoId },
            attributes: ['pontuacao']
        });

        const media = todasAvaliacoes.length > 0
            ? (todasAvaliacoes.reduce((sum, a) => sum + a.pontuacao, 0) / todasAvaliacoes.length).toFixed(2)
            : 0;

        return {
            alojamento, // Incluir detalhes do alojamento na resposta
            total: avaliacoes.count,
            totalPages: Math.ceil(avaliacoes.count / limit),
            currentPage: +page,
            mediaPontuacao: parseFloat(media),
            data: avaliacoes.rows
        };
    },

    // Listar avaliações de um evento específico
    getAvaliacoesEvento: async (eventoId, pagination) => {
        // Verificar se evento existe e buscar detalhes (chamada HTTP)
        const evento = await eventsClient.getEventoById(eventoId);

        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        const avaliacoes = await Avaliacao.findAndCountAll({
            where: { evento_id: eventoId },
            limit: +limit,
            offset: +offset,
            order: [['created_at', 'DESC']]
        });

        // Calcular média de pontuação
        const todasAvaliacoes = await Avaliacao.findAll({
            where: { evento_id: eventoId },
            attributes: ['pontuacao']
        });

        const media = todasAvaliacoes.length > 0
            ? (todasAvaliacoes.reduce((sum, a) => sum + a.pontuacao, 0) / todasAvaliacoes.length).toFixed(2)
            : 0;

        return {
            evento, // Incluir detalhes do evento na resposta
            total: avaliacoes.count,
            totalPages: Math.ceil(avaliacoes.count / limit),
            currentPage: +page,
            mediaPontuacao: parseFloat(media),
            data: avaliacoes.rows
        };
    },

    // Apagar uma avaliação (apenas admin)
    delete: async (id) => {
        const avaliacao = await Avaliacao.findByPk(id);
        
        if (!avaliacao) {
            throw { 
                status: 404, 
                message: "Avaliação não encontrada" 
            };
        }

        await avaliacao.destroy();
        return { message: "Avaliação apagada com sucesso" };
    }
};

module.exports = avaliacaoService;
