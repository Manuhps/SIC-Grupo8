const reservaService = require('../services/reservaService');

const reservasController = {
    // Listar todas as reservas do utilizador autenticado (Minhas Reservas)
    getMinhasReservas: async (req, res) => {
        try {
            const filters = { status: req.query.status };
            const pagination = {
                limit: req.query.limit,
                page: req.query.page
            };
            const result = await reservaService.getMinhasReservas(req.user.id, filters, pagination);
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Obter detalhes de uma reserva específica
    getReservaById: async (req, res) => {
        try {
            const reserva = await reservaService.getById(req.params.id, req.user.id, req.user.tipo);
            res.status(200).json(reserva);
        } catch (error) {
            console.error('Erro ao obter reserva:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao obter reserva";
            res.status(status).json({ mensagem: message });
        }
    },

    // Listar todas as reservas de um alojamento (para proprietários)
    getReservasAlojamento: async (req, res) => {
        try {
            const filters = { status: req.query.status };
            const pagination = {
                limit: req.query.limit,
                page: req.query.page
            };
            const result = await reservaService.getReservasAlojamento(req.params.alojamentoId, filters, pagination, req.user.id);
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Criar uma nova reserva
    fazerReserva: async (req, res) => {
        try {
            const result = await reservaService.create(req.body, req.user.id);
            res.status(201).json(result);
        } catch (error) {
            console.error('Erro ao criar reserva:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao criar reserva";
            res.status(status).json({ mensagem: message });
        }
    },

    // Atualizar status de uma reserva
    updateReservaStatus: async (req, res) => {
        try {
            const result = await reservaService.updateStatus(req.params.id, req.body.status, req.user.id, req.user.tipo);
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Atualizar status de pagamento
    updatePagamento: async (req, res) => {
        try {
            const result = await reservaService.updatePagamento(req.params.id, req.body.pagamento_status);
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Cancelar uma reserva (DELETE) - PARA ESTUDANTES
    cancelarMinhaReserva: async (req, res) => {
        try {
            const result = await reservaService.cancelarMinhaReserva(req.params.id, req.user.id);
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    }
};

module.exports = reservasController;
