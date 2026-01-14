const Evento = require('../models/eventoModel');

const eventoService = {
    // Criar um novo evento
    create: async (data, userId) => {
        const { nome, descricao, data_inicio, data_fim, local, capacidade, preco, imagem, tipo } = data;

        // Validações
        if (!nome || !descricao || !data_inicio || !local || !capacidade || !tipo) {
            throw { 
                status: 400, 
                message: "Campos obrigatórios: nome, descricao, data_inicio, local, capacidade, tipo" 
            };
        }

        // Validar tipo do evento
        const tiposValidos = ['cultural', 'academico', 'lazer'];
        if (!tiposValidos.includes(tipo)) {
            throw { 
                status: 400, 
                message: "Tipo de evento inválido. Os tipos permitidos são: cultural, academico, lazer" 
            };
        }

        const evento = await Evento.create({
            nome,
            descricao,
            data_inicio,
            data_fim: data_fim || null,
            local,
            capacidade,
            preco: preco || 0,
            organizador_id: userId,
            imagem: imagem || null,
            tipo
        });

        return evento;
    },

    // Listar todos os eventos
    getAll: async (filters, pagination) => {
        const { page = 1, limit = 10, tipo, status } = filters;
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

        return {
            total: eventos.count,
            totalPages: Math.ceil(eventos.count / limit),
            currentPage: +page,
            data: eventos.rows
        };
    },

    // Obter um evento específico
    getById: async (id) => {
        const evento = await Evento.findByPk(id);

        if (!evento) {
            throw { 
                status: 404, 
                message: "Evento não encontrado" 
            };
        }

        return evento;
    },

    // Atualizar um evento
    update: async (id, data, userId, userTipo) => {
        const evento = await Evento.findByPk(id);
        
        if (!evento) {
            throw { 
                status: 404, 
                message: "Evento não encontrado" 
            };
        }

        // Verificar se é o organizador ou admin
        if (evento.organizador_id !== userId && userTipo !== 'admin') {
            throw { 
                status: 403, 
                message: "Não autorizado. Apenas o organizador ou admin podem editar este evento." 
            };
        }

        // Atualiza apenas os campos enviados
        const camposPermitidos = ['nome', 'descricao', 'data_inicio', 'data_fim', 'local', 'capacidade', 'preco', 'tipo', 'imagem', 'status'];
        const camposParaAtualizar = {};
        
        camposPermitidos.forEach(campo => {
            if (data[campo] !== undefined) {
                camposParaAtualizar[campo] = data[campo];
            }
        });

        await evento.update(camposParaAtualizar);
        return evento;
    },

    // Excluir um evento
    delete: async (id, userId, userTipo) => {
        const evento = await Evento.findByPk(id);
        
        if (!evento) {
            throw { 
                status: 404, 
                message: "Evento não encontrado" 
            };
        }

        // Verificar se é o organizador ou admin
        if (evento.organizador_id !== userId && userTipo !== 'admin') {
            throw { 
                status: 403, 
                message: "Não autorizado. Apenas o organizador ou admin podem eliminar este evento." 
            };
        }

        await evento.destroy();
        return { message: "Evento apagado com sucesso" };
    }
};

module.exports = eventoService;
