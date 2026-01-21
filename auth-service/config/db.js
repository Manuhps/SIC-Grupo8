const { Sequelize } = require('sequelize');

// 'auth-db' é o nome do container MySQL definido no docker-compose
const sequelize = new Sequelize('auth_db', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize;
