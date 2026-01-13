const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/', eventoController.getAllEventos);
router.get('/:id', eventoController.getEventoById);

// Rotas protegidas
router.post('/', authMiddleware.verifyToken, authMiddleware.isOrganizador, eventoController.createEvento);
router.patch('/:id', authMiddleware.verifyToken, authMiddleware.isOrganizador, eventoController.updateEvento);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isOrganizador, eventoController.deleteEvento);

module.exports = router;
