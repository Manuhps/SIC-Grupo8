const Evento = require('../models/eventoModel');

const eventosController = {
    // Criar um novo evento
    createEvento: async (req, res) => {
        try {
            const { nome, descricao, data_inicio, data_fim, local, capacidade, preco, imagem, tipo } = req.body;
            const organizador_id = req.user.id;

            // Validações
            if (!nome || !descricao || !data_inicio || !local || !capacidade || !tipo) {
                return res.status(400).json({ mensagem: "Campos obrigatórios: nome, descricao, data_inicio, local, capacidade, tipo" });
            }

            // Validar tipo do evento
            const tiposValidos = ['cultural', 'academico', 'lazer'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({ mensagem: "Tipo de evento inválido. Os tipos permitidos são: cultural, academico, lazer" });
            }

            const evento = await Evento.create({
                nome,
                descricao,
                data_inicio,
                data_fim: data_fim || null,
                local,
                capacidade,
                preco: preco || 0,
                organizador_id,
                imagem: imagem || null,
                tipo
            });

            res.status(201).json(evento);
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            res.status(500).json({ mensagem: "Erro ao criar evento" });
        }
    },

    // Listar todos os eventos
    getAllEventos: async (req, res) => {
        try {
            const { page = 1, limit = 10, tipo, status } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if (tipo) where.tipo = tipo;
            if (status) where.status = status;

            const eventos = await Evento.findAndCountAll({
                where,
                limit: +limit,
                offset: +offset,
                order: [['data_inicio', 'ASC']]
            });

            res.status(200).json({
                total: eventos.count,
                totalPages: Math.ceil(eventos.count / limit),
                currentPage: +page,
                data: eventos.rows
            });
        } catch (error) {
            console.error('Erro ao listar eventos:', error);
            res.status(500).json({ mensagem: "Erro ao listar eventos" });
        }
    },

    // Obter um evento específico
    getEventoById: async (req, res) => {
        try {
            const evento = await Evento.findByPk(req.params.id);

            if (!evento) {
                return res.status(404).json({ mensagem: "Evento não encontrado" });
            }

            res.status(200).json(evento);
        } catch (error) {
            console.error('Erro ao obter evento:', error);
            res.status(500).json({ mensagem: "Erro ao obter evento" });
        }
    },

    // Atualizar um evento
    updateEvento: async (req, res) => {
        try {
            const evento = await Evento.findByPk(req.params.id);
            
            if (!evento) {
                return res.status(404).json({ mensagem: "Evento não encontrado" });
            }

            // Verificar se é o organizador ou admin
            if (evento.organizador_id !== req.user.id && req.user.tipo !== 'admin') {
                return res.status(403).json({ mensagem: "Não autorizado. Apenas o organizador ou admin podem editar este evento." });
            }

            // Atualiza apenas os campos enviados
            const camposPermitidos = ['nome', 'descricao', 'data_inicio', 'data_fim', 'local', 'capacidade', 'preco', 'tipo', 'imagem', 'status'];
            const camposParaAtualizar = {};
            
            camposPermitidos.forEach(campo => {
                if (req.body[campo] !== undefined) {
                    camposParaAtualizar[campo] = req.body[campo];
                }
            });

            await evento.update(camposParaAtualizar);
            res.status(200).json(evento);
        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            res.status(500).json({ mensagem: "Erro ao atualizar evento" });
        }
    },

    // Excluir um evento
    deleteEvento: async (req, res) => {
        try {
            const evento = await Evento.findByPk(req.params.id);
            
            if (!evento) {
                return res.status(404).json({ mensagem: "Evento não encontrado" });
            }

            // Verificar se é o organizador ou admin
            if (evento.organizador_id !== req.user.id && req.user.tipo !== 'admin') {
                return res.status(403).json({ mensagem: "Não autorizado. Apenas o organizador ou admin podem eliminar este evento." });
            }

            await evento.destroy();
            res.status(200).json({ mensagem: "Evento apagado com sucesso" });
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
            res.status(500).json({ mensagem: "Erro ao excluir evento" });
        }
    }
};

module.exports = eventosController;
