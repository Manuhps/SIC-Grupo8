const { Avaliacao, User, Alojamento, Evento } = require('../models');

const avaliacoesController = {
    // Criar uma nova avaliação de alojamento
    fazerAvaliacaoAlojamento: async (req, res) => {
        try {
            const { pontuacao, comentario } = req.body;
            const user_id = req.user.id;
            const alojamento_id = req.params.alojamentoId;

            if (!pontuacao) {
                return res.status(400).json({ mensagem: "Pontuação é obrigatória" });
            }

            // Verificar se o user já avaliou este alojamento
            const avaliacaoExistente = await Avaliacao.findOne({
                where: { user_id, alojamento_id }
            });

            if (avaliacaoExistente) {
                return res.status(400).json({ mensagem: "Você já avaliou este alojamento" });
            }

            const avaliacao = await Avaliacao.create({
                user_id,
                alojamento_id,
                pontuacao,
                comentario
            });

            res.status(201).json(avaliacao);
        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            res.status(500).json({ mensagem: "Erro ao criar avaliação" });
        }
    },

    // Criar uma nova avaliação de evento
    fazerAvaliacaoEvento: async (req, res) => {
        try {
            const { pontuacao, comentario } = req.body;
            const user_id = req.user.id;
            const evento_id = req.params.eventoId;

            if (!pontuacao) {
                return res.status(400).json({ mensagem: "Pontuação é obrigatória" });
            }

            // Verificar se o user já avaliou este evento
            const avaliacaoExistente = await Avaliacao.findOne({
                where: { user_id, evento_id }
            });

            if (avaliacaoExistente) {
                return res.status(400).json({ mensagem: "Você já avaliou este evento" });
            }

            const evento = await Evento.findByPk(evento_id);
            if (!evento) {
                return res.status(404).json({ mensagem: "Evento não encontrado" });
            }

            const avaliacao = await Avaliacao.create({
                user_id,
                evento_id,
                pontuacao,
                comentario
            });

            res.status(201).json(avaliacao);
        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            res.status(500).json({ mensagem: "Erro ao criar avaliação" });
        }
    },

    // Listar todas as avaliações
    getAllAvaliacoes: async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const avaliacoes = await Avaliacao.findAndCountAll({
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username']
                    },
                    {
                        model: Alojamento,
                        as: 'alojamento',
                        attributes: ['id', 'nome']
                    },
                    {
                        model: Evento,
                        as: 'evento',
                        attributes: ['id', 'nome']
                    }
                ],
                limit: +limit,
                offset: +offset
            });

            res.status(200).json({
                total: avaliacoes.count,
                totalPages: Math.ceil(avaliacoes.count / limit),
                currentPage: +page,
                data: avaliacoes.rows
            });
        } catch (error) {
            console.error('Erro ao listar avaliações:', error);
            res.status(500).json({ mensagem: "Erro ao listar avaliações" });
        }
    },

    // Obter uma avaliação específica
    getAvaliacaoById: async (req, res) => {
        try {
            const avaliacao = await Avaliacao.findByPk(req.params.id, {
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username']
                    },
                    {
                        model: Alojamento,
                        as: 'alojamento',
                        attributes: ['id', 'nome', 'descricao', 'precoBase', 'imagem', 'zona', 'proprietario_id']
                    },
                    {
                        model: Evento,
                        as: 'evento',
                        attributes: ['id', 'nome', 'descricao', 'data', 'local', 'tipo', 'imagem', 'organizador_id']
                    }
                ]
            });

            if (!avaliacao) {
                return res.status(404).json({ mensagem: "Avaliação não encontrada" });
            }

            res.status(200).json(avaliacao);
        } catch (error) {
            console.error('Erro ao obter avaliação:', error);
            res.status(500).json({ mensagem: "Erro ao obter avaliação" });
        }
    },
    // Apagar uma avaliação
    deleteAvaliacao: async (req, res) => {
        try {
            const avaliacao = await Avaliacao.findByPk(req.params.id);
            
            if (!avaliacao) {
                return res.status(404).json({ mensagem: "Avaliação não encontrada" });
            }

            await avaliacao.destroy();
            res.status(200).json({ mensagem: "Avaliação apagada com sucesso" });
        } catch (error) {
            console.error('Erro ao apagar avaliação:', error);
            res.status(500).json({ mensagem: "Erro ao apagar avaliação" });
        }
    },

    getAvaliacoesAlojamento: async (req, res) => {
        try {
            const { alojamentoId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
    
            // Verifica se o alojamento existe
            const alojamento = await Alojamento.findByPk(alojamentoId);
            if (!alojamento) {
                return res.status(404).json({ mensagem: "Alojamento não encontrado" });
            }
    
            const avaliacoes = await Avaliacao.findAndCountAll({
                where: { alojamento_id: alojamentoId },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username']
                    }
                ],
                limit: +limit,
                offset: +offset
            });
    
            res.status(200).json({
                total: avaliacoes.count,
                totalPages: Math.ceil(avaliacoes.count / limit),
                currentPage: +page,
                data: avaliacoes.rows
            });
        } catch (error) {
            console.error('Erro ao listar avaliações do alojamento:', error);
            res.status(500).json({ mensagem: "Erro ao listar avaliações do alojamento" });
        }
    },
    // Listar avaliações de um evento específico
    getAvaliacoesEvento: async (req, res) => {
        try {
            const { eventoId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            // Verifica se o evento existe
            const evento = await Evento.findByPk(eventoId);
            if (!evento) {
                return res.status(404).json({ mensagem: "Evento não encontrado" });
            }

            const avaliacoes = await Avaliacao.findAndCountAll({
                where: {
                    evento_id: eventoId
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username']
                    }
                ],
                limit: +limit,
                offset: +offset
            });

            res.status(200).json({
                total: avaliacoes.count,
                totalPages: Math.ceil(avaliacoes.count / limit),
                currentPage: +page,
                data: avaliacoes.rows
            });
        } catch (error) {
            console.error('Erro ao listar avaliações do evento:', error);
            res.status(500).json({ mensagem: "Erro ao listar avaliações do evento" });
        }
    }
};

module.exports = avaliacoesController; 