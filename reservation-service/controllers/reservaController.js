const Reserva = require('../models/reservaModel');
const { Op } = require('sequelize');

const reservasController = {
    // Listar todas as reservas do utilizador autenticado (Minhas Reservas)
    getMinhasReservas: async (req, res) => {
        try {
            const userId = req.user.id;
            const { status, limit = 10, page = 0 } = req.query;

            const where = { user_id: userId };
            if (status) where.status = status;

            const reservas = await Reserva.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(page) * parseInt(limit),
                order: [['created_at', 'DESC']]
            });

            if (reservas.count === 0) {
                return res.status(404).json({ errorMessage: "No reservations found for the current user" });
            }

            return res.status(200).json({
                pagination: {
                    total: reservas.count,
                    pages: Math.ceil(reservas.count / limit),
                    current: parseInt(page),
                    limit: parseInt(limit)
                },
                data: reservas.rows
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                errorMessage: "Something went wrong. Please try again later." 
            });
        }
    },

    // Obter detalhes de uma reserva específica
    getReservaById: async (req, res) => {
        try {
            const reserva = await Reserva.findByPk(req.params.id);

            if (!reserva) {
                return res.status(404).json({ mensagem: "Reserva não encontrada" });
            }

            // Verificar se o utilizador tem permissão (dono da reserva ou admin)
            if (reserva.user_id !== req.user.id && req.user.tipo !== 'admin') {
                return res.status(403).json({ 
                    errorMessage: "Não tem permissão para ver esta reserva." 
                });
            }

            res.status(200).json(reserva);
        } catch (error) {
            console.error('Erro ao obter reserva:', error);
            res.status(500).json({ mensagem: "Erro ao obter reserva" });
        }
    },

    // Listar todas as reservas de um alojamento (para proprietários)
    // NOTA: Em microserviços, precisaríamos fazer uma chamada HTTP ao accommodation-service
    // para verificar se o utilizador é proprietário. Por agora, assumimos que o alojamento_id
    // vem validado de outro serviço ou middleware
    getReservasAlojamento: async (req, res) => {
        try {
            const { alojamentoId } = req.params;
            const { status, limit = 10, page = 0 } = req.query;

            const where = { alojamento_id: alojamentoId };
            if (status) where.status = status;

            const reservas = await Reserva.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(page) * parseInt(limit),
                order: [['created_at', 'DESC']]
            });

            if (reservas.count === 0) {
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
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                errorMessage: "Something went wrong. Please try again later." 
            });
        }
    },

    // Criar uma nova reserva
    fazerReserva: async (req, res) => {
        try {
            const { alojamento_id, data_inicio, data_fim, total_preco } = req.body;
            const user_id = req.user.id;

            if (!alojamento_id || !data_inicio || !data_fim) {
                return res.status(400).json({ 
                    mensagem: "Campos obrigatórios: alojamento_id, data_inicio, data_fim" 
                });
            }

            // Validar datas
            const inicio = new Date(data_inicio);
            const fim = new Date(data_fim);
            
            if (inicio >= fim) {
                return res.status(400).json({ 
                    mensagem: "A data de fim deve ser posterior à data de início" 
                });
            }

            if (inicio < new Date()) {
                return res.status(400).json({ 
                    mensagem: "A data de início não pode ser no passado" 
                });
            }

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
                return res.status(400).json({ 
                    mensagem: "Já existe uma reserva para este alojamento nas datas selecionadas" 
                });
            }

            const reserva = await Reserva.create({
                alojamento_id,
                user_id,
                data_inicio,
                data_fim,
                total_preco: total_preco || null,
                status: 'pendente'
            });

            res.status(201).json({
                message: "Reserva criada com sucesso.",
                reserva
            });
        } catch (error) {
            console.error('Erro ao criar reserva:', error);
            res.status(500).json({ mensagem: "Erro ao criar reserva" });
        }
    },

    // Atualizar status de uma reserva
    updateReservaStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { status } = req.body;

            const reserva = await Reserva.findByPk(id);

            if (!reserva) {
                return res.status(404).json({ 
                    errorMessage: "Reservation not found." 
                });
            }

            // Validações de status
            const statusValidos = ['pendente', 'confirmado', 'cancelado', 'concluido', 'rejeitado'];
            if (!statusValidos.includes(status)) {
                return res.status(400).json({ 
                    errorMessage: "Estado inválido. Estados válidos: pendente, confirmado, cancelado, concluido, rejeitado" 
                });
            }

            // Lógica de permissões:
            // - Estudante pode cancelar apenas reservas pendentes dele
            // - Proprietário pode confirmar/rejeitar reservas pendentes do seu alojamento
            // - Admin pode fazer qualquer alteração

            if (req.user.tipo === 'admin') {
                // Admin pode fazer qualquer alteração
                await reserva.update({ status });
                return res.status(200).json({
                    message: "Estado da reserva atualizado com sucesso.",
                    reserva: await Reserva.findByPk(id)
                });
            }

            // Estudante pode cancelar apenas suas reservas pendentes
            if (status === 'cancelado' && reserva.user_id === userId && reserva.status === 'pendente') {
                await reserva.update({ status });
                return res.status(200).json({
                    message: "Reserva cancelada com sucesso.",
                    reserva: await Reserva.findByPk(id)
                });
            }

            // Proprietário pode confirmar/rejeitar reservas pendentes
            // NOTA: Em microserviços, precisaríamos verificar se o user é proprietário
            // fazendo uma chamada HTTP ao accommodation-service
            // Por agora, assumimos que isso foi validado no middleware ou gateway
            if ((status === 'confirmado' || status === 'rejeitado') && reserva.status === 'pendente') {
                await reserva.update({ status });
                return res.status(200).json({
                    message: `Reserva ${status === 'confirmado' ? 'confirmada' : 'rejeitada'} com sucesso.`,
                    reserva: await Reserva.findByPk(id)
                });
            }

            return res.status(403).json({ 
                errorMessage: "Não tem permissão para atualizar esta reserva com este estado." 
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                errorMessage: "Something went wrong. Please try again later." 
            });
        }
    },

    // Atualizar status de pagamento
    updatePagamento: async (req, res) => {
        try {
            const { id } = req.params;
            const { pagamento_status } = req.body;

            const reserva = await Reserva.findByPk(id);

            if (!reserva) {
                return res.status(404).json({ 
                    errorMessage: "Reservation not found." 
                });
            }

            // Validações de status de pagamento
            const statusValidos = ['pendente', 'pago', 'reembolsado'];
            if (!statusValidos.includes(pagamento_status)) {
                return res.status(400).json({ 
                    errorMessage: "Estado do pagamento inválido. Estados válidos: pendente, pago, reembolsado" 
                });
            }

            // Apenas admin ou proprietário (validado externamente) podem atualizar pagamento
            await reserva.update({ pagamento_status });

            return res.status(200).json({
                message: "Estado do pagamento atualizado com sucesso.",
                reserva: await Reserva.findByPk(id)
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                errorMessage: "Something went wrong. Please try again later." 
            });
        }
    },

    // Cancelar uma reserva (DELETE) - PARA ESTUDANTES
    cancelarMinhaReserva: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const reserva = await Reserva.findByPk(id);

            if (!reserva) {
                return res.status(404).json({ 
                    errorMessage: "Reservation not found." 
                });
            }

            // Verifica se o user é o dono da reserva
            if (reserva.user_id !== userId) {
                return res.status(403).json({ 
                    errorMessage: "Não tem permissão para cancelar esta reserva." 
                });
            }

            // Verifica se o estado permite cancelamento pelo estudante
            if (reserva.status !== 'pendente') {
                return res.status(400).json({ 
                    errorMessage: "Apenas pode cancelar reservas pendentes." 
                });
            }

            // Atualiza o estado para cancelado
            await reserva.update({ status: 'cancelado' });

            return res.status(200).json({ 
                message: "Reserva cancelada com sucesso." 
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                errorMessage: "Something went wrong. Please try again later." 
            });
        }
    }
};

module.exports = reservasController;
