const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas (autenticação)
router.post('/login', authController.login);
router.post('/register', authController.register);

// Rotas protegidas (perfil do utilizador)
router.get('/me', authMiddleware.verifyToken, userController.getMe);
router.patch('/me', authMiddleware.verifyToken, userController.updateMe);

// Rotas protegidas (admin apenas)
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getAllUsers);
router.patch('/:userID', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.banUser);
router.patch('/:userID/promote', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.promoteToAdmin);

module.exports = router;

