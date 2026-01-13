const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Para MySQL
const UserMongo = require('../models/userModel.mongo'); // Para MongoDB

const SECRET = process.env.JWT_SECRET || 'PROJECTS_SECRET';

const authController = {
  // Login para MySQL
  async loginSQL(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password são obrigatórios.' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '1d' });
    res.json({ token });
  },
  // Login para MongoDB
  async loginMongo(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password são obrigatórios.' });
    }
    const user = await UserMongo.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, SECRET, { expiresIn: '1d' });
    res.json({ token });
  }
};

module.exports = authController; 