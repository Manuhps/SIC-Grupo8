const eventoService = require('../services/eventoService');

const eventosController = {
    // Criar um novo evento
    createEvento: async (req, res) => {
        try {
            const evento = await eventoService.create(req.body, req.user.id);
            res.status(201).json(evento);
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao criar evento";
            res.status(status).json({ mensagem: message });
        }
    },

    // Listar todos os eventos
    getAllEventos: async (req, res) => {
        try {
            const filters = {
                tipo: req.query.tipo,
                status: req.query.status
            };
            const pagination = {
                page: req.query.page,
                limit: req.query.limit
            };
            const result = await eventoService.getAll(filters, pagination);
            res.status(200).json(result);
        } catch (error) {
            console.error('Erro ao listar eventos:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao listar eventos";
            res.status(status).json({ mensagem: message });
        }
    },

    // Obter um evento específico
    getEventoById: async (req, res) => {
        try {
            const evento = await eventoService.getById(req.params.id);
            res.status(200).json(evento);
        } catch (error) {
            console.error('Erro ao obter evento:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao obter evento";
            res.status(status).json({ mensagem: message });
        }
    },

    // Atualizar um evento
    updateEvento: async (req, res) => {
        try {
            const evento = await eventoService.update(req.params.id, req.body, req.user.id, req.user.tipo);
            res.status(200).json(evento);
        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao atualizar evento";
            res.status(status).json({ mensagem: message });
        }
    },

    // Excluir um evento
    deleteEvento: async (req, res) => {
        try {
            const result = await eventoService.delete(req.params.id, req.user.id, req.user.tipo);
            res.status(200).json(result);
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao excluir evento";
            res.status(status).json({ mensagem: message });
        }
    }
};

module.exports = eventosController;
