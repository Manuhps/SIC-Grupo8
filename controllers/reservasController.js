const { Reserva, Alojamento, User } = require('../models');
const { Op } = require('sequelize');

const reservasController = {
    // Listar todas as reservas do usuário (Minhas Reservas)
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
                include: [{
                    model: Alojamento,
                    as: 'alojamento',
                    include: [{
                        model: User,
                        as: 'proprietario',
                        attributes: ['id', 'username', 'email']
                    }]
                }]
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
                // Links HATEOAS podem ser adicionados aqui
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
            const reserva = await Reserva.findByPk(req.params.id, {
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'email']
                    },
                    {
                        model: Alojamento,
                        as: 'alojamento',
                        include: [{
                            model: User,
                            as: 'proprietario',
                            attributes: ['id', 'username', 'email']
                        }],
                        attributes: ['id', 'nome', 'zona']
                    }
                ]
            });

            if (!reserva) {
                return res.status(404).json({ mensagem: "Reserva não encontrada" });
            }

            res.status(200).json(reserva);
        } catch (error) {
            console.error('Erro ao obter reserva:', error);
            res.status(500).json({ mensagem: "Erro ao obter reserva" });
        }
    },
    // Listar todas as reservas de um alojamento (para proprietários)
    getReservasAlojamento: async (req, res) => {
        try {
            const { alojamentoId } = req.params;
            const userId = req.user.id;
            const { status, limit = 10, page = 0 } = req.query;

            // Verifica se o usuário é o proprietário do alojamento
            const alojamento = await Alojamento.findByPk(alojamentoId);
            if (!alojamento || alojamento.proprietario_id !== userId) {
                return res.status(403).json({ 
                    errorMessage: "This action requires proprietor privileges." 
                });
            }

            const where = { alojamento_id: alojamentoId };
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

    // Criar uma nova reserva (agora `fazerReserva`)
    fazerReserva: async (req, res) => {
        try {
            const { alojamento_id, data_inicio, data_fim } = req.body;
            const user_id = req.user.id;

            if (!alojamento_id || !data_inicio || !data_fim) {
                return res.status(400).json({ mensagem: "Todos os campos são obrigatórios" });
            }

            // Verificar disponibilidade do alojamento (exemplo, precisa de lógica mais robusta)
            const alojamento = await Alojamento.findByPk(alojamento_id);
            if (!alojamento) {
                return res.status(404).json({ mensagem: "Alojamento não encontrado" });
            }

            // Lógica para verificar sobreposição de datas e capacidade aqui (importante para um sistema real)
            // Por enquanto, apenas cria a reserva

            const reserva = await Reserva.create({
                alojamento_id,
                user_id,
                data_inicio,
                data_fim,
                // O total_preco será calculado aqui no backend, ou pode ser enviado no body
                // Por simplicidade, vou assumir que o precoBase do alojamento é o valor por dia
                total_preco: alojamento.precoBase * ((new Date(data_fim) - new Date(data_inicio)) / (1000 * 60 * 60 * 24))
            });

            res.status(201).json(reserva);
        } catch (error) {
            console.error('Erro ao criar reserva:', error);
            res.status(500).json({ mensagem: "Erro ao criar reserva" });
        }
    },

    // Atualizar status de uma reserva (PATCH)
    updateReservaStatus: async (req, res) => {
        try {
            const { id } = req.params; // id da reserva
            const userId = req.user.id;
            const { status } = req.body;

            const reserva = await Reserva.findByPk(id, {
                include: [{
                    model: Alojamento,
                    as: 'alojamento'
                }]
            });

            if (!reserva) {
                return res.status(404).json({ 
                    errorMessage: "Reservation not found." 
                });
            }

            // Verifica se o usuário tem permissão para atualizar a reserva (dono ou proprietário do alojamento)
            if (reserva.user_id !== userId && reserva.alojamento.proprietario_id !== userId) {
                return res.status(403).json({ 
                    errorMessage: "Não tem permissão para atualizar esta reserva." 
                });
            }

            // Validações de status
            if (!['pendente', 'confirmado', 'cancelado', 'concluido'].includes(status)) {
                return res.status(400).json({ 
                    errorMessage: "Estado inválido." 
                });
            }

            // Lógica de permissão para transições de status (ajustar conforme necessário)
            // Ex: Proprietário confirma/rejeita pendente; Estudante cancela pendente.
            if (['confirmado', 'cancelado'].includes(status) && reserva.alojamento.proprietario_id !== userId) {
                 if (status === 'cancelado' && reserva.user_id === userId && reserva.status === 'pendente') { /* Permite */ } // Estudante cancela pendente
                 else if (status === 'confirmado' && reserva.alojamento.proprietario_id === userId && reserva.status === 'pendente') { /* Permite */ } // Proprietário confirma pendente
                 else if (status === 'cancelado' && reserva.alojamento.proprietario_id === userId && reserva.status === 'pendente') { /* Permite */ } // Proprietário cancela pendente
                 else if (status === 'concluido' && reserva.alojamento.proprietario_id === userId && reserva.status === 'confirmado') { /* Permite */ } // Proprietário marca como concluida (opcional)
                 else {
                     return res.status(403).json({ 
                        errorMessage: "Apenas o proprietário pode confirmar/rejeitar. Estudantes só podem cancelar pendentes." // Mensagem mais descritiva
                    });
                 }
            }

             // Se o status for 'cancelada' por um estudante que não é o proprietário, verifica se é o dono da reserva e se o status é 'pendente'
            if (status === 'cancelado' && reserva.user_id === userId && reserva.alojamento.proprietario_id !== userId && reserva.status !== 'pendente') {
                 return res.status(403).json({ 
                    errorMessage: "Apenas pode cancelar reservas pendentes." 
                });
            }
             // Se o status for 'rejeitada' (se adicionado ao ENUM)
             // if (status === 'rejeitada' && reserva.alojamento.proprietario_id !== userId) { ... }

            await reserva.update({ status });

            return res.status(200).json({
                message: "Estado da reserva atualizado com sucesso.",
                reserva
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                errorMessage: "Something went wrong. Please try again later." 
            });
        }
    },

    // Atualizar status de pagamento (PATCH)
    updatePagamento: async (req, res) => {
        try {
            const { id } = req.params; // id da reserva
            const userId = req.user.id;
            const { pagamento_status } = req.body;

            const reserva = await Reserva.findByPk(id, {
                include: [{
                    model: Alojamento,
                    as: 'alojamento'
                }]
            });

            if (!reserva) {
                return res.status(404).json({ 
                    errorMessage: "Reservation not found." 
                });
            }

             // Verifica se o user é o proprietário do alojamento associado à reserva
            if (reserva.alojamento.proprietario_id !== userId) {
                 // Assumindo que apenas o proprietário pode gerir pagamentos
                 return res.status(403).json({ 
                    errorMessage: "Não tem permissão para atualizar o estado do pagamento." 
                 });
            }

            // Validações de status de pagamento
            if (!['pendente', 'pago', 'reembolsado'].includes(pagamento_status)) {
                 return res.status(400).json({ 
                    errorMessage: "Estado do pagamento inválido." 
                 });
            }

             // Apenas o proprietário pode marcar como pago
            if (pagamento_status === 'pago' && reserva.alojamento.proprietario_id !== userId) { // Esta verificação já foi feita acima, mas redundância não faz mal
                 return res.status(403).json({ 
                    errorMessage: "Apenas o proprietário pode marcar o pagamento como efetuado." 
                 });
            }
             // Lógica para reembolso (se necessário)

            await reserva.update({ pagamento_status });

             return res.status(200).json({
                message: "Estado do pagamento atualizado com sucesso.",
                reserva
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                errorMessage: "Something went wrong. Please try again later." 
            });
        }
    },

    // Cancelar uma reserva (DELETE /reservas/{reservaID}) - PARA ESTUDANTES
    cancelarMinhaReserva: async (req, res) => {
        try {
            const { id } = req.params; // id da reserva
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
                    errorMessage: "Não tem permissão para cancelar esta reserva." // Ou "Apenas pode cancelar as suas próprias reservas."
                 });
            }
            // Verifica se o estado permite cancelamento pelo estudante
            if (reserva.estado !== 'pendente') {
                return res.status(400).json({ 
                    errorMessage: "Apenas pode cancelar reservas pendentes." 
                });
            }
            // Atualiza o estado para cancelada
            await reserva.update({ status: 'cancelada' });

            return res.status(200).json({ 
                message: "Reserva cancelada com sucesso." 
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                errorMessage: "Something went wrong. Please try again later." 
            });
        }
    },
};

module.exports = reservasController;
