const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// --- Rotas públicas (autenticação) ---

router.post('/login', (req, res, next) => {
    /* #swagger.tags = ['Auth']
       #swagger.summary = 'Autenticar utilizador'
       #swagger.parameters['obj'] = {
          in: 'body',
          schema: { $ref: '#/definitions/LoginRequest' }
       } */
    next();
}, authController.login);

router.post('/register', (req, res, next) => {
    /* #swagger.tags = ['Auth']
       #swagger.summary = 'Registar novo utilizador'
       #swagger.parameters['obj'] = {
          in: 'body',
          schema: { $ref: '#/definitions/RegisterRequest' }
       } */
    next();
}, authController.register);


// --- Rotas protegidas (perfil) ---

router.get('/me', authMiddleware.verifyToken, (req, res, next) => {
    /* #swagger.tags = ['User Profile']
       #swagger.summary = 'Obter dados do meu perfil'
       #swagger.security = [{ "bearerAuth": [] }] */
    next();
}, userController.getMe);

// Nota: Mantive o updateMe se o tiveres no controller, se não, podes comentar
router.patch('/me', authMiddleware.verifyToken, (req, res, next) => {
    /* #swagger.tags = ['User Profile']
       #swagger.summary = 'Atualizar dados do meu perfil'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['obj'] = {
          in: 'body',
          schema: { $ref: '#/definitions/UpdateMeRequest' }
       } */
    next();
}, userController.updateMe);


// --- Rotas Admin ---

router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, (req, res, next) => {
    /* #swagger.tags = ['Admin']
       #swagger.summary = 'Listar todos os utilizadores'
       #swagger.security = [{ "bearerAuth": [] }] */
    next();
}, userController.getAllUsers);

router.patch('/:userID', authMiddleware.verifyToken, authMiddleware.isAdmin, (req, res, next) => {
    /* #swagger.tags = ['Admin']
       #swagger.summary = 'Banir/Desbanir utilizador'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['obj'] = {
          in: 'body',
          schema: { $ref: '#/definitions/BanRequest' }
       } */
    next();
}, userController.banUser);

// ROTA ADICIONADA: Promoção a Admin
router.patch('/:userID/promote', authMiddleware.verifyToken, authMiddleware.isAdmin, (req, res, next) => {
    /* #swagger.tags = ['Admin']
       #swagger.summary = 'Promover utilizador a Administrador'
       #swagger.security = [{ "bearerAuth": [] }] */
    next();
}, userController.promoteToAdmin);

module.exports = router;