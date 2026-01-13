const { Evento, User, Inscricao } = require('../models');

const eventosController = {
    // Criar um novo evento
    createEvento: async (req, res) => {
        try {
            const { nome, descricao, data_inicio, data_fim, local, capacidade, preco, imagem, tipo } = req.body;
            const organizador_id = req.user.id;

            // Validações simples
            if (!nome || !descricao || !data_inicio || !data_fim || !local || !capacidade || !preco || !tipo) {
                return res.status(400).json({ mensagem: "Todos os campos são obrigatórios" });
            }

            // Validar tipo do evento
            const tiposValidos = ['cultural', 'academico', 'lazer'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({ mensagem: "Tipo de evento inválido. Os tipos permitidos são: cultural, academico, lazer" });
            }

            const evento = await Evento.create({
                nome,
                descricao,
                data: data_inicio, // Usando data_inicio como data do evento
                data_inicio,
                data_fim,
                local,
                capacidade,
                preco,
                organizador_id,
                imagem,
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
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const eventos = await Evento.findAndCountAll({
                include: [{
                    model: User,
                    as: 'organizador',
                    attributes: ['id', 'username', 'email']
                }],
                limit: +limit,
                offset: +offset
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
            const evento = await Evento.findByPk(req.params.id, {
                include: [{
                    model: User,
                    as: 'organizador',
                    attributes: ['id', 'username', 'email']
                }]
            });

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

            if (evento.organizador_id !== req.user.id) {
                return res.status(403).json({ mensagem: "Não autorizado" });
            }

            // Validação simples: se algum campo obrigatório for enviado, todos devem estar preenchidos e preco deve ser número
            const camposObrigatorios = ['nome', 'descricao', 'data_inicio', 'data_fim', 'local', 'capacidade', 'preco', 'tipo', 'imagem'];
            if (camposObrigatorios.some(campo => req.body[campo] !== undefined)) {
                for (const campo of camposObrigatorios) {
                    if (req.body[campo] === undefined || req.body[campo] === null || req.body[campo] === "") {
                        return res.status(400).json({ mensagem: `O campo '${campo}' não pode estar vazio` });
                    }
                }
                if (isNaN(Number(req.body.preco))) {
                    return res.status(400).json({ mensagem: "O campo 'preco' deve ser um número" });
                }
            }

            await evento.update(req.body);
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

            if (evento.organizador_id !== req.user.id) {
                return res.status(403).json({ mensagem: "Não autorizado" });
            }

            await evento.destroy();
            res.status(200).json({ mensagem: "Evento apagado com sucesso" });
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
            res.status(500).json({ mensagem: "Erro ao excluir evento" });
        }
    },

    // Inscrever-se em um evento
    inscreverEmEvento: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const evento = await Evento.findByPk(id);
            
            if (!evento) {
                return res.status(404).json({ mensagem: 'Evento não encontrado' });
            }

            // Verifica se o evento está disponível para inscrições
            if (evento.status !== 'agendado') {
                return res.status(400).json({ 
                    errorMessage: "Este evento não está a aceitar inscrições." 
                });
            }

            // Verifica se já existe uma inscrição
            const inscricaoExistente = await Inscricao.findOne({
                where: {
                    user_id: userId,
                    evento_id: id
                }
            });

            if (inscricaoExistente) {
                return res.status(400).json({ 
                    errorMessage: "Já se encontra inscrito neste evento." 
                });
            }

            // Cria a inscrição
            const inscricao = await Inscricao.create({
                user_id: userId,
                evento_id: id,
                valor_pago: evento.preco
            });

            return res.status(201).json({
                message: "Inscrição efetuada com sucesso.",
                inscricao: {
                    status: inscricao.status,
                    valor_pago: inscricao.valor_pago,
                    user_id: inscricao.user_id,
                    evento_id: inscricao.evento_id,
                    updated_at: inscricao.updated_at,
                    created_at: inscricao.created_at
                }
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                errorMessage: "Ocorreu um erro. Por favor, tente novamente mais tarde." 
            });
        }
    },
}

module.exports = eventosController;
