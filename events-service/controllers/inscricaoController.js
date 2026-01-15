const inscricaoService = require('../services/inscricaoService');

const inscricaoController = {
    // Listar todas as inscrições de um determinado evento (para organizador)
    getAllInscricoes: async (req, res) => {
        try {
            const { eventoId } = req.params;
            const pagination = {
                page: req.query.page || 1,
                limit: req.query.limit || 10
            };

            const result = await inscricaoService.getAllInscricoes(eventoId, pagination);
            res.status(200).json(result);
        } catch (error) {
            console.error('Erro ao listar inscrições:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao listar inscrições";
            res.status(status).json({ mensagem: message });
        }
    },

    // Organizador atualiza o status de uma inscrição do seu evento
    organizadorUpdateInscricao: async (req, res) => {
        try {
            const { eventoId, userId } = req.params;
            const { status } = req.body;
            const organizadorId = req.user.id;

            const inscricao = await inscricaoService.organizadorUpdateInscricao(
                eventoId, 
                userId, 
                status, 
                organizadorId
            );

            res.status(200).json({ 
                mensagem: "Status atualizado com sucesso.", 
                inscricao 
            });
        } catch (error) {
            console.error('Erro ao atualizar inscrição:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao atualizar inscrição";
            res.status(status).json({ mensagem: message });
        }
    },

    // Organizador apaga a inscrição de um participante do seu evento
    deleteInscricao: async (req, res) => {
        try {
            const { eventoId, userId } = req.params;
            const organizadorId = req.user.id;

            const result = await inscricaoService.deleteInscricao(
                eventoId, 
                userId, 
                organizadorId
            );

            res.status(200).json(result);
        } catch (error) {
            console.error('Erro ao apagar inscrição:', error);
            const status = error.status || 500;
            const message = error.message || "Erro ao apagar inscrição";
            res.status(status).json({ mensagem: message });
        }
    }
};

module.exports = inscricaoController;
