const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas protegidas
router.get('/minhas', authMiddleware.verifyToken, reservaController.getMinhasReservas);
router.get('/:id', authMiddleware.verifyToken, reservaController.getReservaById);
router.get('/alojamento/:alojamentoId', authMiddleware.verifyToken, authMiddleware.isProprietario, reservaController.getReservasAlojamento);
router.post('/', authMiddleware.verifyToken, authMiddleware.isEstudante, reservaController.fazerReserva);
router.patch('/:id/status', authMiddleware.verifyToken, reservaController.updateReservaStatus);
router.patch('/:id/pagamento', authMiddleware.verifyToken, authMiddleware.isProprietario, reservaController.updatePagamento);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isEstudante, reservaController.cancelarMinhaReserva);

module.exports = router;
