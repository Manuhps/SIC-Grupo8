const Reserva = require('../models/reservaModel');
const { Op } = require('sequelize');
const accommodationClient = require('../utils/accommodationClient');

const reservaService = {
    // Listar todas as reservas do utilizador
    getMinhasReservas: async (userId, filters, pagination) => {
        const { status } = filters;
        const { limit = 10, page = 0 } = pagination;

        const where = { user_id: userId };
        if (status) where.status = status;

        const reservas = await Reserva.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(page) * parseInt(limit),
            order: [['created_at', 'DESC']]
        });

        if (reservas.count === 0) {
            throw { 
                status: 404, 
                message: "No reservations found for the current user" 
            };
        }

        return {
            pagination: {
                total: reservas.count,
                pages: Math.ceil(reservas.count / limit),
                current: parseInt(page),
                limit: parseInt(limit)
            },
            data: reservas.rows
        };
    },

    // Obter detalhes de uma reserva específica
    getById: async (id, userId, userTipo) => {
        const reserva = await Reserva.findByPk(id);

        if (!reserva) {
            throw { 
                status: 404, 
                message: "Reserva não encontrada" 
            };
        }

        // Verificar se o utilizador tem permissão (dono da reserva ou admin)
        if (reserva.user_id !== userId && userTipo !== 'admin') {
            throw { 
                status: 403, 
                message: "Não tem permissão para ver esta reserva." 
            };
        }

        return reserva;
    },

    // Listar todas as reservas de um alojamento
    getReservasAlojamento: async (alojamentoId, filters, pagination, userId) => {
        // Verificar se alojamento existe e se user é proprietário
        const alojamento = await accommodationClient.getAlojamentoById(alojamentoId);
        
        // Verificar se o user é o proprietário
        if (alojamento.proprietario_id !== userId) {
            throw {
                status: 403,
                message: "Não autorizado. Apenas o proprietário pode ver as reservas deste alojamento."
            };
        }

        const { status } = filters;
        const { limit = 10, page = 0 } = pagination;

        const where = { alojamento_id: alojamentoId };
        if (status) where.status = status;

        const reservas = await Reserva.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(page) * parseInt(limit),
            order: [['created_at', 'DESC']]
        });

        if (reservas.count === 0) {
            return {
                pagination: {
                    total: 0,
                    pages: 0,
                    current: parseInt(page),
                    limit: parseInt(limit)
                },
                data: []
            };
        }

        return {
            pagination: {
                total: reservas.count,
                pages: Math.ceil(reservas.count / limit),
                current: parseInt(page),
                limit: parseInt(limit)
            },
            data: reservas.rows
        };
    },

    // Criar uma nova reserva
    create: async (data, userId) => {
        const { alojamento_id, data_inicio, data_fim } = data;

        // Validações
        if (!alojamento_id || !data_inicio || !data_fim) {
            throw { 
                status: 400, 
                message: "Campos obrigatórios: alojamento_id, data_inicio, data_fim" 
            };
        }

        // Verificar se alojamento existe (chamada HTTP ao Accommodation Service)
        const alojamento = await accommodationClient.getAlojamentoById(alojamento_id);

        // Validar datas
        const inicio = new Date(data_inicio);
        const fim = new Date(data_fim);
        
        if (inicio >= fim) {
            throw { 
                status: 400, 
                message: "A data de fim deve ser posterior à data de início" 
            };
        }

        if (inicio < new Date()) {
            throw { 
                status: 400, 
                message: "A data de início não pode ser no passado" 
            };
        }

        // Calcular número de dias e preço total automaticamente
        const diffTime = Math.abs(fim - inicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const precoBase = alojamento.precoBase || 0;
        const total_preco = diffDays * precoBase;

        // Verificar sobreposição de reservas (para o mesmo alojamento)
        const reservasExistentes = await Reserva.findAll({
            where: {
                alojamento_id,
                status: {
                    [Op.in]: ['pendente', 'confirmado']
                },
                [Op.or]: [
                    {
                        data_inicio: {
                            [Op.between]: [data_inicio, data_fim]
                        }
                    },
                    {
                        data_fim: {
                            [Op.between]: [data_inicio, data_fim]
                        }
                    },
                    {
                        [Op.and]: [
                            { data_inicio: { [Op.lte]: data_inicio } },
                            { data_fim: { [Op.gte]: data_fim } }
                        ]
                    }
                ]
            }
        });

        if (reservasExistentes.length > 0) {
            throw { 
                status: 400, 
                message: "Já existe uma reserva para este alojamento nas datas selecionadas" 
            };
        }

        const reserva = await Reserva.create({
            alojamento_id,
            user_id: userId,
            data_inicio,
            data_fim,
            total_preco, // Calculado automaticamente
            status: 'pendente'
        });

        return {
            message: "Reserva criada com sucesso.",
            reserva,
            detalhes: {
                alojamento: alojamento.nome,
                preco_por_noite: precoBase,
                noites: diffDays,
                total: total_preco
            }
        };
    },

    // Atualizar status de uma reserva
    updateStatus: async (id, status, userId, userTipo) => {
        const reserva = await Reserva.findByPk(id);

        if (!reserva) {
            throw { 
                status: 404, 
                message: "Reservation not found." 
            };
        }

        // Validações de status
        const statusValidos = ['pendente', 'confirmado', 'cancelado', 'concluido', 'rejeitado'];
        if (!statusValidos.includes(status)) {
            throw { 
                status: 400, 
                message: "Estado inválido. Estados válidos: pendente, confirmado, cancelado, concluido, rejeitado" 
            };
        }

        // Lógica de permissões
        if (userTipo === 'admin') {
            // Admin pode fazer qualquer alteração
            await reserva.update({ status });
            return {
                message: "Estado da reserva atualizado com sucesso.",
                reserva: await Reserva.findByPk(id)
            };
        }

        // Estudante pode cancelar apenas suas reservas pendentes
        if (status === 'cancelado' && reserva.user_id === userId && reserva.status === 'pendente') {
            await reserva.update({ status });
            return {
                message: "Reserva cancelada com sucesso.",
                reserva: await Reserva.findByPk(id)
            };
        }

        // Proprietário pode confirmar/rejeitar reservas pendentes
        // Verificar se o user é realmente proprietário do alojamento (chamada HTTP)
        if ((status === 'confirmado' || status === 'rejeitado') && reserva.status === 'pendente') {
            const alojamento = await accommodationClient.getAlojamentoById(reserva.alojamento_id);
            
            // Verificar se o user é o proprietário
            if (alojamento.proprietario_id !== userId) {
                throw {
                    status: 403,
                    message: "Não tem permissão. Apenas o proprietário do alojamento pode confirmar/rejeitar reservas."
                };
            }

            await reserva.update({ status });
            return {
                message: `Reserva ${status === 'confirmado' ? 'confirmada' : 'rejeitada'} com sucesso.`,
                reserva: await Reserva.findByPk(id)
            };
        }

        throw { 
            status: 403, 
            message: "Não tem permissão para atualizar esta reserva com este estado." 
        };
    },

    // Atualizar status de pagamento
    updatePagamento: async (id, pagamento_status) => {
        const reserva = await Reserva.findByPk(id);

        if (!reserva) {
            throw { 
                status: 404, 
                message: "Reservation not found." 
            };
        }

        // Validações de status de pagamento
        const statusValidos = ['pendente', 'pago', 'reembolsado'];
        if (!statusValidos.includes(pagamento_status)) {
            throw { 
                status: 400, 
                message: "Estado do pagamento inválido. Estados válidos: pendente, pago, reembolsado" 
            };
        }

        // Apenas admin ou proprietário (validado externamente) podem atualizar pagamento
        await reserva.update({ pagamento_status });

        return {
            message: "Estado do pagamento atualizado com sucesso.",
            reserva: await Reserva.findByPk(id)
        };
    },

    // Cancelar uma reserva (para estudantes)
    cancelarMinhaReserva: async (id, userId) => {
        const reserva = await Reserva.findByPk(id);

        if (!reserva) {
            throw { 
                status: 404, 
                message: "Reservation not found." 
            };
        }

        // Verifica se o user é o dono da reserva
        if (reserva.user_id !== userId) {
            throw { 
                status: 403, 
                message: "Não tem permissão para cancelar esta reserva." 
            };
        }

        // Verifica se o estado permite cancelamento pelo estudante
        if (reserva.status !== 'pendente') {
            throw { 
                status: 400, 
                message: "Apenas pode cancelar reservas pendentes." 
            };
        }

        // Atualiza o estado para cancelado
        await reserva.update({ status: 'cancelado' });

        return { 
            message: "Reserva cancelada com sucesso." 
        };
    }
};

module.exports = reservaService;
