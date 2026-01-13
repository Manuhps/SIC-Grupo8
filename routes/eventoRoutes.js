const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventosController');
const authMiddleware = require('../middlewares/authMiddleware');
const avaliacoesController = require('../controllers/avaliacoesController');
const inscricoesController = require('../controllers/inscricoesController');

// Rotas públicas
router.get('/', eventosController.getAllEventos);
router.get('/:id', eventosController.getEventoById);

// Rotas protegidas
router.post('/', authMiddleware.verifyToken, authMiddleware.isOrganizador, eventosController.createEvento);
router.patch('/:id', authMiddleware.verifyToken, authMiddleware.isOrganizador, eventosController.updateEvento);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isOrganizador, eventosController.deleteEvento);
router.get('/:eventoId/avaliacoes', authMiddleware.verifyToken, avaliacoesController.getAvaliacoesEvento);

// Rotas para gerenciar inscrições
router.get('/:eventoId/inscritos', authMiddleware.verifyToken, authMiddleware.isOrganizador, inscricoesController.getAllInscricoes);
router.patch('/:eventoId/inscricoes/:userId', authMiddleware.verifyToken, authMiddleware.isOrganizador, inscricoesController.organizadorUpdateInscricao);
router.delete('/:eventoId/inscricoes/:userId', authMiddleware.verifyToken, authMiddleware.isOrganizador, inscricoesController.deleteInscricao);

router.post('/:id/inscrever', authMiddleware.verifyToken, authMiddleware.isEstudante, eventosController.inscreverEmEvento);

router.post('/:eventoId/avaliacao', authMiddleware.verifyToken, avaliacoesController.fazerAvaliacaoEvento);

module.exports = router; 