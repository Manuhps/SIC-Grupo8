const Avaliacao = require('../models/avaliacaoModel');

const avaliacoesController = {
    // Criar uma nova avaliação de alojamento
    fazerAvaliacaoAlojamento: async (req, res) => {
        try {
            const { pontuacao, comentario } = req.body;
            const user_id = req.user.id;
            const alojamento_id = req.params.alojamentoId;

            if (!pontuacao) {
                return res.status(400).json({ 
                    mensagem: "Pontuação é obrigatória",
                    details: "A pontuação deve ser um número entre 1 e 5"
                });
            }

            if (pontuacao < 1 || pontuacao > 5) {
                return res.status(400).json({ 
                    mensagem: "Pontuação inválida",
                    details: "A pontuação deve ser um número entre 1 e 5"
                });
            }

            // Verificar se o user já avaliou este alojamento
            const avaliacaoExistente = await Avaliacao.findOne({
                where: { 
                    user_id, 
                    alojamento_id 
                }
            });

            if (avaliacaoExistente) {
                return res.status(400).json({ 
                    mensagem: "Você já avaliou este alojamento",
                    details: "Cada utilizador pode avaliar um alojamento apenas uma vez"
                });
            }

            // Verificar se pelo menos um dos IDs (alojamento ou evento) está presente
            if (!alojamento_id) {
                return res.status(400).json({ 
                    mensagem: "ID do alojamento é obrigatório" 
                });
            }

            const avaliacao = await Avaliacao.create({
                user_id,
                alojamento_id,
                evento_id: null,
                pontuacao,
                comentario: comentario || null
            });

            res.status(201).json({
                message: "Avaliação criada com sucesso.",
                avaliacao
            });
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
                return res.status(400).json({ 
                    mensagem: "Pontuação é obrigatória",
                    details: "A pontuação deve ser um número entre 1 e 5"
                });
            }

            if (pontuacao < 1 || pontuacao > 5) {
                return res.status(400).json({ 
                    mensagem: "Pontuação inválida",
                    details: "A pontuação deve ser um número entre 1 e 5"
                });
            }

            // Verificar se o user já avaliou este evento
            const avaliacaoExistente = await Avaliacao.findOne({
                where: { 
                    user_id, 
                    evento_id 
                }
            });

            if (avaliacaoExistente) {
                return res.status(400).json({ 
                    mensagem: "Você já avaliou este evento",
                    details: "Cada utilizador pode avaliar um evento apenas uma vez"
                });
            }

            // Verificar se pelo menos um dos IDs (alojamento ou evento) está presente
            if (!evento_id) {
                return res.status(400).json({ 
                    mensagem: "ID do evento é obrigatório" 
                });
            }

            const avaliacao = await Avaliacao.create({
                user_id,
                alojamento_id: null,
                evento_id,
                pontuacao,
                comentario: comentario || null
            });

            res.status(201).json({
                message: "Avaliação criada com sucesso.",
                avaliacao
            });
        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            res.status(500).json({ mensagem: "Erro ao criar avaliação" });
        }
    },

    // Listar todas as avaliações (apenas admin)
    getAllAvaliacoes: async (req, res) => {
        try {
            const { page = 1, limit = 10, tipo } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if (tipo === 'alojamento') {
                where.alojamento_id = { [require('sequelize').Op.ne]: null };
            } else if (tipo === 'evento') {
                where.evento_id = { [require('sequelize').Op.ne]: null };
            }

            const avaliacoes = await Avaliacao.findAndCountAll({
                where,
                limit: +limit,
                offset: +offset,
                order: [['created_at', 'DESC']]
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
            const avaliacao = await Avaliacao.findByPk(req.params.id);

            if (!avaliacao) {
                return res.status(404).json({ mensagem: "Avaliação não encontrada" });
            }

            res.status(200).json(avaliacao);
        } catch (error) {
            console.error('Erro ao obter avaliação:', error);
            res.status(500).json({ mensagem: "Erro ao obter avaliação" });
        }
    },

    // Listar avaliações de um alojamento específico
    getAvaliacoesAlojamento: async (req, res) => {
        try {
            const { alojamentoId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const avaliacoes = await Avaliacao.findAndCountAll({
                where: { alojamento_id: alojamentoId },
                limit: +limit,
                offset: +offset,
                order: [['created_at', 'DESC']]
            });

            // Calcular média de pontuação
            const todasAvaliacoes = await Avaliacao.findAll({
                where: { alojamento_id: alojamentoId },
                attributes: ['pontuacao']
            });

            const media = todasAvaliacoes.length > 0
                ? (todasAvaliacoes.reduce((sum, a) => sum + a.pontuacao, 0) / todasAvaliacoes.length).toFixed(2)
                : 0;

            res.status(200).json({
                total: avaliacoes.count,
                totalPages: Math.ceil(avaliacoes.count / limit),
                currentPage: +page,
                mediaPontuacao: parseFloat(media),
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

            const avaliacoes = await Avaliacao.findAndCountAll({
                where: { evento_id: eventoId },
                limit: +limit,
                offset: +offset,
                order: [['created_at', 'DESC']]
            });

            // Calcular média de pontuação
            const todasAvaliacoes = await Avaliacao.findAll({
                where: { evento_id: eventoId },
                attributes: ['pontuacao']
            });

            const media = todasAvaliacoes.length > 0
                ? (todasAvaliacoes.reduce((sum, a) => sum + a.pontuacao, 0) / todasAvaliacoes.length).toFixed(2)
                : 0;

            res.status(200).json({
                total: avaliacoes.count,
                totalPages: Math.ceil(avaliacoes.count / limit),
                currentPage: +page,
                mediaPontuacao: parseFloat(media),
                data: avaliacoes.rows
            });
        } catch (error) {
            console.error('Erro ao listar avaliações do evento:', error);
            res.status(500).json({ mensagem: "Erro ao listar avaliações do evento" });
        }
    },

    // Apagar uma avaliação (apenas admin)
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
    }
};

module.exports = avaliacoesController;
