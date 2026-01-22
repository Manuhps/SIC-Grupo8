const express = require('express');
const router = express.Router();
const alojamentoController = require('../controllers/alojamentoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/', (req, res, next) => {
    // #swagger.tags = ['Accommodations']
    next();
}, alojamentoController.getAllAlojamentos);

router.get('/:id', (req, res, next) => {
    // #swagger.tags = ['Accommodations']
    next();
}, alojamentoController.getAlojamentoById);

// Rotas protegidas
router.post('/', authMiddleware.verifyToken, authMiddleware.isProprietario, (req, res, next) => {
    /* #swagger.tags = ['Accommodations']
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['obj'] = {
          in: 'body',
          schema: { $ref: '#/definitions/AlojamentoRequest' }
       } */
    next();
}, alojamentoController.createAlojamento);

router.patch('/:id', authMiddleware.verifyToken, authMiddleware.isProprietario, (req, res, next) => {
    /* #swagger.tags = ['Accommodations']
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['obj'] = {
          in: 'body',
          schema: { $ref: '#/definitions/AlojamentoRequest' }
       } */
    next();
}, alojamentoController.patchAlojamento);

router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isProprietario, (req, res, next) => {
    /* #swagger.tags = ['Accommodations']
       #swagger.security = [{ "bearerAuth": [] }] */
    next();
}, alojamentoController.deleteAlojamento);

module.exports = router;