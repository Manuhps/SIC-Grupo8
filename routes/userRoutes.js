const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas
router.post('/login', userController.login);
router.post('/',  userController.register);

// Rotas protegidas
router.get('/me', authMiddleware.verifyToken, userController.getMe);
router.patch('/me', authMiddleware.verifyToken, userController.updateMe);
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getAllUsers);
router.patch('/:userID', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.banUser);
router.patch('/:userID/promote', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.promoteToAdmin);

module.exports = router; 