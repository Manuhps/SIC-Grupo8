const alojamentoService = require('../services/alojamentoService');
const pino = require('pino');
const logger = pino({ transport: { target: 'pino-pretty' } });

const alojamentosController = {
    // Criar um novo alojamento
    createAlojamento: async (req, res) => {
        try {
            logger.info({ userId: req.user.id }, "Iniciando criação de alojamento");
            const alojamento = await alojamentoService.create(req.body, req.user.id);
            logger.info({ alojamentoId: alojamento.id }, "Alojamento criado com sucesso");
            res.status(201).json(alojamento);
        } catch (error) {
            logger.error({ error: error.message }, 'Erro ao criar alojamento');
            const status = error.status || 500;
            const message = error.message || "Erro ao criar alojamento";
            res.status(status).json({ mensagem: message });
        }
    },

    // Listar todos os alojamentos
    getAllAlojamentos: async (req, res) => {
        try {
            logger.info("Listagem de todos os alojamentos solicitada");
            const pagination = {
                page: req.query.page,
                limit: req.query.limit
            };
            const result = await alojamentoService.getAll({}, pagination);
            res.status(200).json(result);
        } catch (error) {
            logger.error({ error: error.message }, 'Erro ao listar alojamentos');
            const status = error.status || 500;
            const message = error.message || "Erro ao listar alojamentos";
            res.status(status).json({ mensagem: message });
        }
    },

    // Obter um alojamento específico
    getAlojamentoById: async (req, res) => {
        try {
            const alojamento = await alojamentoService.getById(req.params.id);
            res.status(200).json(alojamento);
        } catch (error) {
            logger.error({ error: error.message, id: req.params.id }, 'Erro ao obter alojamento');
            const status = error.status || 500;
            const message = error.message || "Erro ao obter alojamento";
            res.status(status).json({ mensagem: message });
        }
    },

    // Atualizar parcialmente um alojamento
    patchAlojamento: async (req, res) => {
        try {
            logger.info({ id: req.params.id, userId: req.user.id }, "Atualizando alojamento (patch)");
            const alojamento = await alojamentoService.update(req.params.id, req.body, req.user.id);
            logger.info({ id: req.params.id }, "Alojamento atualizado com sucesso");
            res.status(200).json(alojamento);
        } catch (error) {
            logger.error({ error: error.message, id: req.params.id }, 'Erro ao atualizar alojamento');
            const status = error.status || 500;
            const message = error.message || "Erro ao atualizar alojamento";
            res.status(status).json({ mensagem: message });
        }
    },
    
    // Excluir um alojamento
    deleteAlojamento: async (req, res) => {
        try {
            logger.info({ id: req.params.id, userId: req.user.id }, "Eliminando alojamento");
            const result = await alojamentoService.delete(req.params.id, req.user.id);
            logger.info({ id: req.params.id }, "Alojamento eliminado com sucesso");
            res.status(200).json(result);
        } catch (error) {
            logger.error({ error: error.message, id: req.params.id }, 'Erro ao excluir alojamento');
            const status = error.status || 500;
            const message = error.message || "Erro ao excluir alojamento";
            res.status(status).json({ mensagem: message });
        }
    }
};

module.exports = alojamentosController;