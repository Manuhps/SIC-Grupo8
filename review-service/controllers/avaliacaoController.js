const avaliacaoService = require('../services/avaliacaoService');

const avaliacoesController = {
    // Criar uma nova avaliação de alojamento
    fazerAvaliacaoAlojamento: async (req, res) => {
        try {
            const result = await avaliacaoService.createAlojamento(req.params.alojamentoId, req.body, req.user.id);
            res.status(201).json(result);
        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao criar avaliação";
            const details = error.details;
            res.status(status).json({ 
                mensagem: message,
                ...(details && { details })
            });
        }
    },

    // Criar uma nova avaliação de evento
    fazerAvaliacaoEvento: async (req, res) => {
        try {
            const result = await avaliacaoService.createEvento(req.params.eventoId, req.body, req.user.id);
            res.status(201).json(result);
        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao criar avaliação";
            const details = error.details;
            res.status(status).json({ 
                mensagem: message,
                ...(details && { details })
            });
        }
    },

    // Listar todas as avaliações (apenas admin)
    getAllAvaliacoes: async (req, res) => {
        try {
            const filters = { tipo: req.query.tipo };
            const pagination = {
                page: req.query.page,
                limit: req.query.limit
            };
            const result = await avaliacaoService.getAll(filters, pagination);
            res.status(200).json(result);
        } catch (error) {
            console.error('Erro ao listar avaliações:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao listar avaliações";
            res.status(status).json({ mensagem: message });
        }
    },

    // Obter uma avaliação específica
    getAvaliacaoById: async (req, res) => {
        try {
            const avaliacao = await avaliacaoService.getById(req.params.id);
            res.status(200).json(avaliacao);
        } catch (error) {
            console.error('Erro ao obter avaliação:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao obter avaliação";
            res.status(status).json({ mensagem: message });
        }
    },

    // Listar avaliações de um alojamento específico
    getAvaliacoesAlojamento: async (req, res) => {
        try {
            const pagination = {
                page: req.query.page,
                limit: req.query.limit
            };
            const result = await avaliacaoService.getAvaliacoesAlojamento(req.params.alojamentoId, pagination);
            res.status(200).json(result);
        } catch (error) {
            console.error('Erro ao listar avaliações do alojamento:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao listar avaliações do alojamento";
            res.status(status).json({ mensagem: message });
        }
    },

    // Listar avaliações de um evento específico
    getAvaliacoesEvento: async (req, res) => {
        try {
            const pagination = {
                page: req.query.page,
                limit: req.query.limit
            };
            const result = await avaliacaoService.getAvaliacoesEvento(req.params.eventoId, pagination);
            res.status(200).json(result);
        } catch (error) {
            console.error('Erro ao listar avaliações do evento:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao listar avaliações do evento";
            res.status(status).json({ mensagem: message });
        }
    },

    // Apagar uma avaliação (apenas admin)
    deleteAvaliacao: async (req, res) => {
        try {
            const result = await avaliacaoService.delete(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            console.error('Erro ao apagar avaliação:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao apagar avaliação";
            res.status(status).json({ mensagem: message });
        }
    }
};

module.exports = avaliacoesController;
