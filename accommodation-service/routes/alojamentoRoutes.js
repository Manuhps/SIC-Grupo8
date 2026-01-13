const express = require('express');
const router = express.Router();
const alojamentoController = require('../controllers/alojamentoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/', alojamentoController.getAllAlojamentos);
router.get('/:id', alojamentoController.getAlojamentoById);

// Rotas protegidas
router.post('/', authMiddleware.verifyToken, authMiddleware.isProprietario, alojamentoController.createAlojamento);
router.patch('/:id', authMiddleware.verifyToken, authMiddleware.isProprietario, alojamentoController.patchAlojamento);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isProprietario, alojamentoController.deleteAlojamento);

module.exports = router; 