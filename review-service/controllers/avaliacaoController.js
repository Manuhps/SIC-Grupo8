const avaliacaoService = require('../services/avaliacaoService');
const pino = require('pino');
const logger = pino({ transport: { target: 'pino-pretty' } });

const avaliacoesController = {
    // Criar uma nova avaliação de alojamento
    fazerAvaliacaoAlojamento: async (req, res) => {
        try {
            logger.info({ userId: req.user.id, alojamentoId: req.params.alojamentoId }, "Tentativa de avaliar alojamento");
            const result = await avaliacaoService.createAlojamento(req.params.alojamentoId, req.body, req.user.id);
            logger.info({ reviewId: result.id }, "Avaliação de alojamento criada com sucesso");
            res.status(201).json(result);
        } catch (error) {
            logger.error({ error: error.message, userId: req.user.id }, "Erro ao criar avaliação de alojamento");
            const status = error.status || 500;
            const message = error.message || "Erro ao criar avaliação";
            res.status(status).json({ mensagem: message, ...(error.details && { details: error.details }) });
        }
    },

    // Criar uma nova avaliação de evento
    fazerAvaliacaoEvento: async (req, res) => {
        try {
            logger.info({ userId: req.user.id, eventoId: req.params.eventoId }, "Tentativa de avaliar evento");
            const result = await avaliacaoService.createEvento(req.params.eventoId, req.body, req.user.id);
            logger.info({ reviewId: result.id }, "Avaliação de evento criada com sucesso");
            res.status(201).json(result);
        } catch (error) {
            logger.error({ error: error.message, userId: req.user.id }, "Erro ao criar avaliação de evento");
            const status = error.status || 500;
            const message = error.message || "Erro ao criar avaliação";
            res.status(status).json({ mensagem: message, ...(error.details && { details: error.details }) });
        }
    },

    // Listar todas as avaliações (apenas admin)
    getAllAvaliacoes: async (req, res) => {
        try {
            logger.info({ adminId: req.user.id }, "Admin listando todas as avaliações");
            const filters = { tipo: req.query.tipo };
            const pagination = { page: req.query.page, limit: req.query.limit };
            const result = await avaliacaoService.getAll(filters, pagination);
            res.status(200).json(result);
        } catch (error) {
            logger.error({ error: error.message }, "Erro ao listar todas as avaliações");
            res.status(error.status || 500).json({ mensagem: error.message || "Erro ao listar avaliações" });
        }
    },

    // Obter detalhes de uma avaliação específica
    getAvaliacaoById: async (req, res) => {
        try {
            const avaliacao = await avaliacaoService.getById(req.params.id);
            res.status(200).json(avaliacao);
        } catch (error) {
            logger.error({ error: error.message, reviewId: req.params.id }, "Erro ao obter avaliação");
            res.status(error.status || 500).json({ mensagem: error.message || "Erro ao obter avaliação" });
        }
    },

    // Listar avaliações de um alojamento específico
    getAvaliacoesAlojamento: async (req, res) => {
        try {
            logger.info({ alojamentoId: req.params.alojamentoId }, "Consultando avaliações do alojamento");
            const pagination = { page: req.query.page, limit: req.query.limit };
            const result = await avaliacaoService.getAvaliacoesAlojamento(req.params.alojamentoId, pagination);
            res.status(200).json(result);
        } catch (error) {
            logger.error({ error: error.message, alojamentoId: req.params.alojamentoId }, "Erro ao listar avaliações do alojamento");
            res.status(error.status || 500).json({ mensagem: error.message || "Erro ao listar avaliações do alojamento" });
        }
    },

    // Listar avaliações de um evento específico
    getAvaliacoesEvento: async (req, res) => {
        try {
            logger.info({ eventoId: req.params.eventoId }, "Consultando avaliações do evento");
            const pagination = { page: req.query.page, limit: req.query.limit };
            const result = await avaliacaoService.getAvaliacoesEvento(req.params.eventoId, pagination);
            res.status(200).json(result);
        } catch (error) {
            logger.error({ error: error.message, eventoId: req.params.eventoId }, "Erro ao listar avaliações do evento");
            res.status(error.status || 500).json({ mensagem: error.message || "Erro ao listar avaliações do evento" });
        }
    },

    // Apagar uma avaliação (apenas admin)
    deleteAvaliacao: async (req, res) => {
        try {
            logger.warn({ reviewId: req.params.id, adminId: req.user.id }, "Admin apagando avaliação");
            const result = await avaliacaoService.delete(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            logger.error({ error: error.message, reviewId: req.params.id }, "Erro ao apagar avaliação");
            res.status(error.status || 500).json({ mensagem: error.message || "Erro ao apagar avaliação" });
        }
    }
};

module.exports = avaliacoesController;