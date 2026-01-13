const express = require('express');
const router = express.Router();
const avaliacoesController = require('../controllers/avaliacaoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/:id', avaliacoesController.getAvaliacaoById);
router.get('/alojamento/:alojamentoId', avaliacoesController.getAvaliacoesAlojamento);
router.get('/evento/:eventoId', avaliacoesController.getAvaliacoesEvento);

// Rotas protegidas
router.post('/alojamento/:alojamentoId', authMiddleware.verifyToken, authMiddleware.isEstudante, avaliacoesController.fazerAvaliacaoAlojamento);
router.post('/evento/:eventoId', authMiddleware.verifyToken, authMiddleware.isEstudante, avaliacoesController.fazerAvaliacaoEvento);
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, avaliacoesController.getAllAvaliacoes);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, avaliacoesController.deleteAvaliacao);

module.exports = router;
