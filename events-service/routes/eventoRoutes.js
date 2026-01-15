const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const inscricaoController = require('../controllers/inscricaoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/', eventoController.getAllEventos);
router.get('/:id', eventoController.getEventoById);

// Rotas protegidas - Eventos
router.post('/', authMiddleware.verifyToken, authMiddleware.isOrganizador, eventoController.createEvento);
router.patch('/:id', authMiddleware.verifyToken, authMiddleware.isOrganizador, eventoController.updateEvento);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isOrganizador, eventoController.deleteEvento);

// Rotas de Inscrições - Estudantes podem inscrever-se
router.post('/:id/inscrever', authMiddleware.verifyToken, authMiddleware.isEstudante, eventoController.inscreverEmEvento);

// Rotas de Inscrições - Organizadores podem gerir inscrições
router.get('/:eventoId/inscritos', authMiddleware.verifyToken, authMiddleware.isOrganizador, inscricaoController.getAllInscricoes);
router.patch('/:eventoId/inscricoes/:userId', authMiddleware.verifyToken, authMiddleware.isOrganizador, inscricaoController.organizadorUpdateInscricao);
router.delete('/:eventoId/inscricoes/:userId', authMiddleware.verifyToken, authMiddleware.isOrganizador, inscricaoController.deleteInscricao);

module.exports = router;
