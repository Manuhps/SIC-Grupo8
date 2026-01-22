const reservaService = require('../services/reservaService');
const pino = require('pino');
const logger = pino({ transport: { target: 'pino-pretty' } });

const reservasController = {
    // Listar todas as reservas do utilizador autenticado (Minhas Reservas)
    getMinhasReservas: async (req, res) => {
        try {
            logger.info({ userId: req.user.id }, "Listando reservas do utilizador");
            const filters = { status: req.query.status };
            const pagination = {
                limit: req.query.limit,
                page: req.query.page
            };
            const result = await reservaService.getMinhasReservas(req.user.id, filters, pagination);
            return res.status(200).json(result);
        } catch (error) {
            logger.error({ error: error.message, userId: req.user.id }, "Erro ao listar reservas do utilizador");
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Obter detalhes de uma reserva específica
    getReservaById: async (req, res) => {
        try {
            logger.info({ reservaId: req.params.id, userId: req.user.id }, "Obtendo detalhes da reserva");
            const reserva = await reservaService.getById(req.params.id, req.user.id, req.user.tipo);
            res.status(200).json(reserva);
        } catch (error) {
            logger.error({ error: error.message, reservaId: req.params.id }, "Erro ao obter detalhes da reserva");
            const status = error.status || 500;
            const message = error.message || "Erro ao obter reserva";
            res.status(status).json({ mensagem: message });
        }
    },

    // Listar todas as reservas de um alojamento (para proprietários)
    getReservasAlojamento: async (req, res) => {
        try {
            logger.info({ alojamentoId: req.params.alojamentoId, userId: req.user.id }, "Proprietário consultando reservas do alojamento");
            const filters = { status: req.query.status };
            const pagination = {
                limit: req.query.limit,
                page: req.query.page
            };
            const result = await reservaService.getReservasAlojamento(req.params.alojamentoId, filters, pagination, req.user.id);
            return res.status(200).json(result);
        } catch (error) {
            logger.error({ error: error.message, alojamentoId: req.params.alojamentoId }, "Erro ao listar reservas do alojamento");
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Criar uma nova reserva
    fazerReserva: async (req, res) => {
        try {
            logger.info({ userId: req.user.id, alojamentoId: req.body.alojamento_id }, "Tentativa de nova reserva");
            const result = await reservaService.create(req.body, req.user.id);
            logger.info({ reservaId: result.id }, "Reserva criada com sucesso");
            res.status(201).json(result);
        } catch (error) {
            logger.error({ error: error.message, userId: req.user.id }, "Erro ao criar reserva");
            const status = error.status || 500;
            const message = error.message || "Erro ao criar reserva";
            res.status(status).json({ mensagem: message });
        }
    },

    // Atualizar status de uma reserva
    updateReservaStatus: async (req, res) => {
        try {
            logger.info({ reservaId: req.params.id, novoStatus: req.body.status }, "Atualizando status da reserva");
            const result = await reservaService.updateStatus(req.params.id, req.body.status, req.user.id, req.user.tipo);
            return res.status(200).json(result);
        } catch (error) {
            logger.error({ error: error.message, reservaId: req.params.id }, "Erro ao atualizar status da reserva");
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Atualizar status de pagamento
    updatePagamento: async (req, res) => {
        try {
            logger.info({ reservaId: req.params.id, pagamento: req.body.pagamento_status }, "Atualizando status de pagamento");
            const result = await reservaService.updatePagamento(req.params.id, req.body.pagamento_status);
            return res.status(200).json(result);
        } catch (error) {
            logger.error({ error: error.message, reservaId: req.params.id }, "Erro no pagamento");
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    },

    // Cancelar uma reserva (DELETE)
    cancelarMinhaReserva: async (req, res) => {
        try {
            logger.warn({ reservaId: req.params.id, userId: req.user.id }, "Cancelando reserva");
            const result = await reservaService.cancelarMinhaReserva(req.params.id, req.user.id);
            return res.status(200).json(result);
        } catch (error) {
            logger.error({ error: error.message, reservaId: req.params.id }, "Erro ao cancelar reserva");
            const status = error.status || 500;
            const message = error.message || "Something went wrong. Please try again later.";
            return res.status(status).json({ errorMessage: message });
        }
    }
};

module.exports = reservasController;