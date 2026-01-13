const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas protegidas 
router.get('/minhas', authMiddleware.verifyToken, reservasController.getMinhasReservas);
router.get('/:id', authMiddleware.verifyToken, reservasController.getReservaById);
router.post('/fazerReserva', authMiddleware.verifyToken, authMiddleware.isEstudante, reservasController.fazerReserva);
router.patch('/:id/updateStatus', authMiddleware.verifyToken, authMiddleware.isProprietario, reservasController.updateReservaStatus);
router.patch('/:id/updatePagamento', authMiddleware.verifyToken, authMiddleware.isProprietario, reservasController.updatePagamento);
router.delete('/:id/cancelarMinhaReserva', authMiddleware.verifyToken, authMiddleware.isEstudante, reservasController.cancelarMinhaReserva);

module.exports = router; 