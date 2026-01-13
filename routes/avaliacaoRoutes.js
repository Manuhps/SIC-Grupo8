const express = require('express');
const router = express.Router();
const avaliacoesController = require('../controllers/avaliacoesController');
const authMiddleware = require('../middlewares/authMiddleware');


// Rotas públicas
router.get('/:id', avaliacoesController.getAvaliacaoById);

// Rotas protegidas
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, avaliacoesController.getAllAvaliacoes);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, avaliacoesController.deleteAvaliacao);

module.exports = router; 