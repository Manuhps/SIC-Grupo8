const Alojamento = require('../models/alojamentoModel');

const alojamentosController = {
    // Criar um novo alojamento
    createAlojamento: async (req, res) => {
        try {
            const { nome, descricao, precoBase, zona, tipo, imagem } = req.body;
            const proprietario_id = req.user.id;

            if (!nome || !descricao || !precoBase || !zona || !tipo) {
                return res.status(400).json({ mensagem: "Todos os campos são obrigatórios" });
            }

            const alojamento = await Alojamento.create({
                nome,
                descricao,
                precoBase,
                zona,
                tipo,
                imagem,
                proprietario_id
            });

            res.status(201).json(alojamento);
        } catch (error) {
            console.error('Erro ao criar alojamento:', error);
            res.status(500).json({ mensagem: "Erro ao criar alojamento" });
        }
    },

    // Listar todos os alojamentos
    getAllAlojamentos: async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const alojamentos = await Alojamento.findAndCountAll({
                limit: +limit,
                offset: +offset
            });

            res.status(200).json({
                total: alojamentos.count,
                totalPages: Math.ceil(alojamentos.count / limit),
                currentPage: +page,
                data: alojamentos.rows
            });
        } catch (error) {
            console.error('Erro ao listar alojamentos:', error);
            res.status(500).json({ mensagem: "Erro ao listar alojamentos" });
        }
    },

    // Obter um alojamento específico
    getAlojamentoById: async (req, res) => {
        try {
            const alojamento = await Alojamento.findByPk(req.params.id);

            if (!alojamento) {
                return res.status(404).json({ mensagem: "Alojamento não encontrado" });
            }

            res.status(200).json(alojamento);
        } catch (error) {
            console.error('Erro ao obter alojamento:', error);
            res.status(500).json({ mensagem: "Erro ao obter alojamento" });
        }
    },

    // Atualizar parcialmente um alojamento
    patchAlojamento: async (req, res) => {
        try {
            const alojamento = await Alojamento.findByPk(req.params.id);
            
            if (!alojamento) {
                return res.status(404).json({ mensagem: "Alojamento não encontrado" });
            }

            if (alojamento.proprietario_id !== req.user.id) {
                return res.status(403).json({ mensagem: "Não autorizado" });
            }

            // Validação simples: se algum campo obrigatório for enviado, todos devem estar preenchidos e precoBase deve ser número
            const camposObrigatorios = ['nome', 'descricao', 'precoBase', 'zona', 'tipo', 'imagem'];
            if (camposObrigatorios.some(campo => req.body[campo] !== undefined)) {
                for (const campo of camposObrigatorios) {
                    if (req.body[campo] === undefined || req.body[campo] === null || req.body[campo] === "") {
                        return res.status(400).json({ mensagem: `O campo '${campo}' não pode estar vazio` });
                    }
                }
                if (isNaN(Number(req.body.precoBase))) {
                    return res.status(400).json({ mensagem: "O campo 'precoBase' deve ser um número" });
                }
            }

            // Atualiza apenas os campos enviados
            const camposPermitidos = ['nome', 'descricao', 'precoBase', 'zona', 'tipo', 'imagem'];
            const camposParaAtualizar = {};
            
            camposPermitidos.forEach(campo => {
                if (req.body[campo] !== undefined) {
                    camposParaAtualizar[campo] = req.body[campo];
                }
            });

            await alojamento.update(camposParaAtualizar);
            res.status(200).json(alojamento);
        } catch (error) {
            console.error('Erro ao atualizar alojamento:', error);
            res.status(500).json({ mensagem: "Erro ao atualizar alojamento" });
        }
    },

    
    // Excluir um alojamento
    deleteAlojamento: async (req, res) => {
        try {
            const alojamento = await Alojamento.findByPk(req.params.id);
            
            if (!alojamento) {
                return res.status(404).json({ mensagem: "Alojamento não encontrado" });
            }

            if (alojamento.proprietario_id !== req.user.id) {
                return res.status(403).json({ mensagem: "Não autorizado" });
            }

            await alojamento.destroy();
            res.status(200).json({ mensagem: "Alojamento apagado com sucesso" });
        } catch (error) {
            console.error('Erro ao excluir alojamento:', error);
            res.status(500).json({ mensagem: "Erro ao excluir alojamento" });
        }
    }
};

module.exports = alojamentosController;
