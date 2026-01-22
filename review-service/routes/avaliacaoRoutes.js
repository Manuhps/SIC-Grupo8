const express = require('express');
const router = express.Router();
const avaliacoesController = require('../controllers/avaliacaoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas

router.get('/:id', (req, res, next) => {
    /* #swagger.tags = ['Reviews'] */
    /* #swagger.description = 'Obtém detalhes de uma avaliação específica.' */
    avaliacoesController.getAvaliacaoById(req, res, next);
});

router.get('/alojamento/:alojamentoId', (req, res, next) => {
    /* #swagger.tags = ['Reviews'] */
    /* #swagger.description = 'Lista todas as avaliações de um alojamento.' */
    avaliacoesController.getAvaliacoesAlojamento(req, res, next);
});

router.get('/evento/:eventoId', (req, res, next) => {
    /* #swagger.tags = ['Reviews'] */
    /* #swagger.description = 'Lista todas as avaliações de um evento.' */
    avaliacoesController.getAvaliacoesEvento(req, res, next);
});

// Rotas protegidas

router.post('/alojamento/:alojamentoId', authMiddleware.verifyToken, authMiddleware.isEstudante, (req, res, next) => {
    /* #swagger.tags = ['Reviews'] */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.parameters['obj'] = {
        in: 'body',
        description: 'Dados da avaliação do alojamento',
        schema: { $ref: "#/definitions/ReviewAlojamento" }
    } */
    avaliacoesController.fazerAvaliacaoAlojamento(req, res, next);
});

router.post('/evento/:eventoId', authMiddleware.verifyToken, authMiddleware.isEstudante, (req, res, next) => {
    /* #swagger.tags = ['Reviews'] */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.parameters['obj'] = {
        in: 'body',
        description: 'Dados da avaliação do evento',
        schema: { $ref: "#/definitions/ReviewEvento" }
    } */
    avaliacoesController.fazerAvaliacaoEvento(req, res, next);
});

router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, (req, res, next) => {
    /* #swagger.tags = ['Reviews'] */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.description = 'Lista todas as avaliações do sistema (Acesso Admin).' */
    avaliacoesController.getAllAvaliacoes(req, res, next);
});

router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, (req, res, next) => {
    /* #swagger.tags = ['Reviews'] */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.description = 'Apaga uma avaliação permanentemente (Acesso Admin).' */
    avaliacoesController.deleteAvaliacao(req, res, next);
});

module.exports = router;