const alojamentoService = require('../services/alojamentoService');

const alojamentosController = {
    // Criar um novo alojamento
    createAlojamento: async (req, res) => {
        try {
            const alojamento = await alojamentoService.create(req.body, req.user.id);
            res.status(201).json(alojamento);
        } catch (error) {
            console.error('Erro ao criar alojamento:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao criar alojamento";
            res.status(status).json({ mensagem: message });
        }
    },

    // Listar todos os alojamentos
    getAllAlojamentos: async (req, res) => {
        try {
            const pagination = {
                page: req.query.page,
                limit: req.query.limit
            };
            const result = await alojamentoService.getAll({}, pagination);
            res.status(200).json(result);
        } catch (error) {
            console.error('Erro ao listar alojamentos:', error);
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
            console.error('Erro ao obter alojamento:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao obter alojamento";
            res.status(status).json({ mensagem: message });
        }
    },

    // Atualizar parcialmente um alojamento
    patchAlojamento: async (req, res) => {
        try {
            const alojamento = await alojamentoService.update(req.params.id, req.body, req.user.id);
            res.status(200).json(alojamento);
        } catch (error) {
            console.error('Erro ao atualizar alojamento:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao atualizar alojamento";
            res.status(status).json({ mensagem: message });
        }
    },
    
    // Excluir um alojamento
    deleteAlojamento: async (req, res) => {
        try {
            const result = await alojamentoService.delete(req.params.id, req.user.id);
            res.status(200).json(result);
        } catch (error) {
            console.error('Erro ao excluir alojamento:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao excluir alojamento";
            res.status(status).json({ mensagem: message });
        }
    }
};

module.exports = alojamentosController;
