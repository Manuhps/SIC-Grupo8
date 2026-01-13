const { Alojamento, User } = require('../models');

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
                include: [{
                    model: User,
                    as: 'proprietario',
                    attributes: ['id', 'username', 'email']
                }],
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
            const alojamento = await Alojamento.findByPk(req.params.id, {
                include: [{
                    model: User,
                    as: 'proprietario',
                    attributes: ['id', 'username', 'email']
                }]
            });

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

    // Listar todas as reservas de um alojamento (para proprietários)
    getReservasAlojamento: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { status, limit = 10, page = 0 } = req.query;

            // Verifica se o usuário é o proprietário do alojamento
            const alojamento = await Alojamento.findByPk(id);
            if (!alojamento || alojamento.proprietario_id !== userId) {
                return res.status(403).json({ 
                    errorMessage: "This action requires proprietor privileges." 
                });
            }

            const where = { alojamento_id: id };
            if (status) where.status = status;

            const reservas = await Reserva.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(page) * parseInt(limit),
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email']
                }]
            });

             if (reservas.count === 0) {
                 // A documentação menciona 404, mas 200 com lista vazia também é comum
                return res.status(200).json({
                    pagination: {
                        total: 0,
                        pages: 0,
                        current: parseInt(page),
                        limit: parseInt(limit)
                    },
                    data: []
                });
            }

            return res.status(200).json({
                 pagination: {
                    total: reservas.count,
                    pages: Math.ceil(reservas.count / limit),
                    current: parseInt(page),
                    limit: parseInt(limit)
                },
                data: reservas.rows
                // Links HATEOAS podem ser adicionados aqui
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                errorMessage: "Something went wrong. Please try again later." 
            });
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
