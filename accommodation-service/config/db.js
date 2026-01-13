const { Sequelize } = require('sequelize');

// Repara que o host agora é 'accommodation-db'
const sequelize = new Sequelize('accommodation_db', 'root', 'root', {
    host: 'accommodation-db',
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize;