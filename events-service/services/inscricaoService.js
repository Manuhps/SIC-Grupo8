const Inscricao = require('../models/inscricaoModel');
const Evento = require('../models/eventoModel');

const inscricaoService = {
    // Inscrever-se em um evento
    inscreverEmEvento: async (eventoId, userId) => {
        // Verificar se o evento existe
        const evento = await Evento.findByPk(eventoId);
        
        if (!evento) {
            throw { 
                status: 404, 
                message: "Evento não encontrado" 
            };
        }

        // Verifica se o evento está disponível para inscrições
        if (evento.status !== 'agendado') {
            throw { 
                status: 400, 
                message: "Este evento não está a aceitar inscrições." 
            };
        }

        // Verifica se já existe uma inscrição
        const inscricaoExistente = await Inscricao.findOne({
            where: {
                user_id: userId,
                evento_id: eventoId
            }
        });

        if (inscricaoExistente) {
            throw { 
                status: 400, 
                message: "Já se encontra inscrito neste evento." 
            };
        }

        // Cria a inscrição
        const inscricao = await Inscricao.create({
            user_id: userId,
            evento_id: eventoId,
            valor_pago: evento.preco
        });

        return inscricao;
    },

    // Listar todas as inscrições de um determinado evento (para organizador)
    getAllInscricoes: async (eventoId, pagination) => {
        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        // Verificar se o evento existe
        const evento = await Evento.findByPk(eventoId);
        if (!evento) {
            throw { 
                status: 404, 
                message: "Evento não encontrado" 
            };
        }

        const inscricoes = await Inscricao.findAndCountAll({
            where: { evento_id: eventoId },
            limit: +limit,
            offset: +offset,
            order: [['created_at', 'DESC']]
        });

        return {
            total: inscricoes.count,
            totalPages: Math.ceil(inscricoes.count / limit),
            currentPage: +page,
            data: inscricoes.rows
        };
    },

    // Organizador atualiza o status de uma inscrição do seu evento
    organizadorUpdateInscricao: async (eventoId, userId, status, organizadorId) => {
        // Buscar o evento
        const evento = await Evento.findByPk(eventoId);
        if (!evento) {
            throw { 
                status: 404, 
                message: "Evento não encontrado" 
            };
        }

        // Verificar se o user autenticado é o organizador
        if (evento.organizador_id !== organizadorId) {
            throw { 
                status: 403, 
                message: "Apenas o organizador do evento pode atualizar inscrições." 
            };
        }

        // Buscar a inscrição pelo par (evento_id, user_id)
        const inscricao = await Inscricao.findOne({
            where: { evento_id: eventoId, user_id: userId }
        });

        if (!inscricao) {
            throw { 
                status: 404, 
                message: "Inscrição não encontrada" 
            };
        }

        // Validar status permitido
        if (!['concluido', 'cancelado'].includes(status)) {
            throw { 
                status: 400, 
                message: "Status inválido. Os status permitidos são: concluido, cancelado" 
            };
        }

        await inscricao.update({ status });
        return inscricao;
    },

    // Organizador apaga a inscrição de um participante do seu evento
    deleteInscricao: async (eventoId, userId, organizadorId) => {
        // Buscar o evento
        const evento = await Evento.findByPk(eventoId);
        if (!evento) {
            throw { 
                status: 404, 
                message: "Evento não encontrado" 
            };
        }

        // Verificar se o user autenticado é o organizador
        if (evento.organizador_id !== organizadorId) {
            throw { 
                status: 403, 
                message: "Apenas o organizador do evento pode apagar inscrições." 
            };
        }

        // Buscar a inscrição pelo par (evento_id, user_id)
        const inscricao = await Inscricao.findOne({
            where: { evento_id: eventoId, user_id: userId }
        });

        if (!inscricao) {
            throw { 
                status: 404, 
                message: "Inscrição não encontrada" 
            };
        }

        await inscricao.destroy();
        return { message: "Inscrição apagada com sucesso." };
    }
};

module.exports = inscricaoService;
