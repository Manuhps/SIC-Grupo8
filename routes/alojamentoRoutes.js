const express = require('express');
const router = express.Router();
const alojamentosController = require('../controllers/alojamentosController');
const authMiddleware = require('../middlewares/authMiddleware');
const reservasController = require('../controllers/reservasController');
const avaliacoesController = require('../controllers/avaliacoesController');

// Rotas públicas
router.get('/', alojamentosController.getAllAlojamentos);
router.get('/:id', alojamentosController.getAlojamentoById);

// Rotas protegidas
router.get('/:alojamentoId/avaliacoes', authMiddleware.verifyToken, avaliacoesController.getAvaliacoesAlojamento);
router.post('/:alojamentoId/avaliacao', authMiddleware.verifyToken, avaliacoesController.fazerAvaliacaoAlojamento);

router.get('/:alojamentoId/reservas', authMiddleware.verifyToken, authMiddleware.isProprietario, reservasController.getReservasAlojamento);
router.post('/', authMiddleware.verifyToken, authMiddleware.isProprietario, alojamentosController.createAlojamento);
router.patch('/:id', authMiddleware.verifyToken, authMiddleware.isProprietario, alojamentosController.patchAlojamento);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isProprietario, alojamentosController.deleteAlojamento);

module.exports = router; 