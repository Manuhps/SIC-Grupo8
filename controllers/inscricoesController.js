const { Inscricao, Evento, User } = require('../models');

const inscricoesController = {
    // Listar todas as inscrições de um determinado evento
    getAllInscricoes: async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            const { eventoId } = req.params;

            const evento = await Evento.findByPk(eventoId);
            if (!evento) {
                return res.status(404).json({ mensagem: 'Evento não encontrado' });
            }

            const where = eventoId ? { evento_id: eventoId } : {};

            const inscricoes = await Inscricao.findAndCountAll({
                where,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'email']
                    },
                    {
                        model: Evento,
                        as: 'evento',
                        attributes: ['id', 'nome', 'data']
                    }
                ],
                limit: +limit,
                offset: +offset
            });

            res.status(200).json({
                total: inscricoes.count,
                totalPages: Math.ceil(inscricoes.count / limit),
                currentPage: +page,
                data: inscricoes.rows
            });
        } catch (error) {
            console.error('Erro ao listar inscrições:', error);
            res.status(500).json({ mensagem: "Erro ao listar inscrições" });
        }
    },
    // Organizador atualiza o status de uma inscrição do seu evento
    organizadorUpdateInscricao: async (req, res) => {
        try {
            const { eventoId, userId } = req.params;
            const { status } = req.body;
            const organizadorId = req.user.id;

            // Buscar o evento
            const evento = await Evento.findByPk(eventoId);
            if (!evento) {
                return res.status(404).json({ mensagem: 'Evento não encontrado' });
            }

            // Verificar se o user autenticado é o organizador
            if (evento.organizador_id !== organizadorId) {
                return res.status(403).json({ mensagem: 'Apenas o organizador do evento pode atualizar inscrições.' });
            }

            // Buscar a inscrição pelo par (evento_id, user_id)
            const inscricao = await Inscricao.findOne({
                where: { evento_id: eventoId, user_id: userId }
            });
            if (!inscricao) {
                return res.status(404).json({ mensagem: 'Inscrição não encontrada' });
            }

            // Validar status permitido
            if (!['concluido', 'cancelado'].includes(status)) {
                return res.status(400).json({ mensagem: 'Status inválido.' });
            }

            await inscricao.update({ status });
            return res.status(200).json({ mensagem: 'Status atualizado com sucesso.', inscricao });

        } catch (error) {
            console.error('Erro ao atualizar inscrição:', error);
            res.status(500).json({ mensagem: 'Erro ao atualizar inscrição.' });
        }
    },
    // Organizador apaga a inscrição de um participante do seu evento
    deleteInscricao: async (req, res) => {
        try {
            const { eventoId, userId } = req.params;
            const organizadorId = req.user.id;

            // Buscar o evento
            const evento = await Evento.findByPk(eventoId);
            if (!evento) {
                return res.status(404).json({ mensagem: 'Evento não encontrado' });
            }

            // Verificar se o user autenticado é o organizador
            if (evento.organizador_id !== organizadorId) {
                return res.status(403).json({ mensagem: 'Apenas o organizador do evento pode apagar inscrições.' });
            }

            // Buscar a inscrição pelo par (evento_id, user_id)
            const inscricao = await Inscricao.findOne({
                where: { evento_id: eventoId, user_id: userId }
            });
            if (!inscricao) {
                return res.status(404).json({ mensagem: 'Inscrição não encontrada' });
            }

            await inscricao.destroy();
            return res.status(200).json({ mensagem: 'Inscrição apagada com sucesso.' });

        } catch (error) {
            console.error('Erro ao apagar inscrição:', error);
            res.status(500).json({ mensagem: 'Erro ao apagar inscrição.' });
        }
    }
};

module.exports = inscricoesController; 