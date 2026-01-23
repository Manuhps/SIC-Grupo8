const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

// Middleware para autenticação JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Proxy para cada microserviço
app.use('/auth', createProxyMiddleware({ target: 'http://auth-service:3001', changeOrigin: true }));
app.use('/accommodations', createProxyMiddleware({ target: 'http://accommodation-service:3002', changeOrigin: true }));
app.use('/events', createProxyMiddleware({ target: 'http://events-service:3003', changeOrigin: true }));
app.use('/reservations', createProxyMiddleware({ target: 'http://reservation-service:3004', changeOrigin: true }));
app.use('/reviews', createProxyMiddleware({ target: 'http://review-service:3005', changeOrigin: true }));

// Exemplo de rota protegida
app.use('/secure', authMiddleware, (req, res) => {
  res.json({ message: 'Acesso autorizado!', user: req.user });
});

app.listen(PORT, () => {
  console.log(`API Gateway a correr na porta ${PORT}`);
});
