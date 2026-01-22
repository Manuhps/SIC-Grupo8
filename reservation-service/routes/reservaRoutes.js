const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas protegidas

router.get('/minhas', authMiddleware.verifyToken, (req, res, next) => {
    /* #swagger.tags = ['Reservations'] */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    reservaController.getMinhasReservas(req, res, next);
});

router.get('/:id', authMiddleware.verifyToken, (req, res, next) => {
    /* #swagger.tags = ['Reservations'] */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    reservaController.getReservaById(req, res, next);
});

router.get('/alojamento/:alojamentoId', authMiddleware.verifyToken, authMiddleware.isProprietario, (req, res, next) => {
    /* #swagger.tags = ['Reservations'] */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    reservaController.getReservasAlojamento(req, res, next);
});

router.post('/', authMiddleware.verifyToken, authMiddleware.isEstudante, (req, res, next) => {
    /* #swagger.tags = ['Reservations'] */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.parameters['obj'] = {
        in: 'body',
        description: 'Dados para criar uma reserva',
        schema: { $ref: "#/definitions/ReservaRequest" }
    } */
    reservaController.fazerReserva(req, res, next);
});

router.patch('/:id/status', authMiddleware.verifyToken, (req, res, next) => {
    /* #swagger.tags = ['Reservations'] */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.parameters['obj'] = {
        in: 'body',
        description: 'Novo status da reserva',
        schema: { $ref: "#/definitions/UpdateStatusRequest" }
    } */
    reservaController.updateReservaStatus(req, res, next);
});

router.patch('/:id/pagamento', authMiddleware.verifyToken, authMiddleware.isProprietario, (req, res, next) => {
    /* #swagger.tags = ['Reservations'] */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.parameters['obj'] = {
        in: 'body',
        description: 'Novo status de pagamento',
        schema: { $ref: "#/definitions/UpdatePagamentoRequest" }
    } */
    reservaController.updatePagamento(req, res, next);
});

router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isEstudante, (req, res, next) => {
    /* #swagger.tags = ['Reservations'] */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    reservaController.cancelarMinhaReserva(req, res, next);
});

module.exports = router;